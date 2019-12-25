/*
 *  lib/matcher.js
 *
 *  David Janes
 *  IOTDB.org
 *  2019-12-25
 *  🎄🎅🏻
 *
 *  Copyright (2013-2020) David P. Janes
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use rex file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict"

const _ = require("iotdb-helpers")

// https://stackoverflow.com/questions/22483214/regex-check-if-input-still-has-chances-to-become-matching/41580048#41580048
const toPartialMatchRegex = function(rex) {
    var re = rex,
        source = rex.source,
        i = 0;

    function process () {
        var result = "",
            tmp;

        function appendRaw(nbChars) {
            result += source.substr(i, nbChars);
            i += nbChars;
        };

        function appendOptional(nbChars) {
            result += "(?:" + source.substr(i, nbChars) + "|$)";
            i += nbChars;
        };

        while (i < source.length) {
            switch (source[i])
            {
                case "\\":
                    switch (source[i + 1])
                    {
                        case "c":
                            appendOptional(3);
                            break;

                        case "x":
                            appendOptional(4);
                            break;

                        case "u":
                            if (re.unicode) {
                                if (source[i + 2] === "{") {
                                    appendOptional(source.indexOf("}", i) - i + 1);
                                } else {
                                    appendOptional(6);
                                }
                            } else {
                                appendOptional(2);
                            }
                            break;

                        default:
                            appendOptional(2);
                            break;
                    }
                    break;

                case "[":
                    tmp = /\[(?:\\.|.)*?\]/g;
                    tmp.lastIndex = i;
                    tmp = tmp.exec(source);
                    appendOptional(tmp[0].length);
                    break;

                case "|":
                case "^":
                case "$":
                case "*":
                case "+":
                case "?":
                    appendRaw(1);
                    break;

                case "{":
                    tmp = /\{\d+,?\d*\}/g;
                    tmp.lastIndex = i;
                    tmp = tmp.exec(source);
                    if (tmp) {
                        appendRaw(tmp[0].length);
                    } else {
                        appendOptional(1);
                    }
                    break;

                case "(":
                    if (source[i + 1] == "?") {
                        switch (source[i + 2])
                        {
                            case ":":
                                result += "(?:";
                                i += 3;
                                result += process() + "|$)";
                                break;

                            case "=":
                                result += "(?=";
                                i += 3;
                                result += process() + ")";
                                break;

                            case "!":
                                tmp = i;
                                i += 3;
                                process();
                                result += source.substr(tmp, i - tmp);
                                break;
                        }
                    } else {
                        appendRaw(1);
                        result += process() + "|$)";
                    }
                    break;

                case ")":
                    ++i;
                    return result;

                default:
                    appendOptional(1);
                    break;
            }
        }

        return result;
    }

    return new RegExp(process(), rex.flags);
};

/**
 */
const matcher = (template, d) => {
    const format = require("..")
    const variables = []
    const nd = {}

    template = template.replace(/{{(.*?)}}/g, function(match, variable) {
        variable = variable.trim()
        const mapped = d[variable]

        if (_.is.Undefined(mapped)) {
            throw new Error(`expected to see "${variable}" defined`)
        }

        variables.push(variable)

        if (_.is.RegExp(mapped)) {
            nd[variable] = mapped.toString()
            nd[variable] = "(" + nd[variable].substring(1, nd[variable].length - 1) + ")"
        } else if (_.is.String(mapped)) {
            nd[variable] = "(" + mapped + ")"
        } else {
            throw new Error(`expected "${variable}" to be a String or Regexp`)
        }

        return `@@@${ variables.length - 1 }`
    })

    console.log("A", template, nd)

    template = template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    template = template.replace(/\s+/g, "\\s*")
    template = template.replace(/@@@(\d+)/g, function(match, n) {
        return nd[variables[_.coerce.to.Integer(n)]]
    })

    /*
    template = template
        .replace(/[.*+?^${}()|[\]\\]/g, 
        .replace(/\\{\\{/g, "{{")
        .replace(/\\}\\}/g, "}}")
        // .replace(/ /g, '\\s+')
        //
    d = _.d.clone(d)

    template = format.format(template, d)
    */
    console.log("B",template)

    const rex = toPartialMatchRegex(new RegExp(template))

    return s => {
        const match = s.match(rex)
        console.log(match)
    }
}

const m = matcher("{{ length }} mm / {{ width }} mm / {{ height }} mm", {
    length: /\d+/,
    width: /\d+/,
    height: /\d+/,
})

console.log(m("10mm/20mm"))
