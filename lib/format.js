/*
 *  lib/format.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-01-09
 *
 *  Copyright (2013-2020) David P. Janes
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
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

const _ = require('iotdb-helpers')

/**
 *  LOTS OF WORK NEEDED FOR NON-STRINGS: REFERENCE DJANGO
 */
const _format_string = function (template, d, fd, paramd) {
    if (!_.is.Dictionary(paramd)) {
        paramd = {
            dotpath: !!paramd,
        }
    }

    d = _.d.compose.shallow(d, {})
    fd = _.d.compose.shallow(fd, {
        upper: s => s.toUpperCase(),
        lower: s => s.toLowerCase(),
        binary: (s, for_false, for_true) => _.coerce.to.Boolean(s, false) ? for_true : for_false,
        'default': (s, otherwise) => (s.length === 0) ? otherwise : s,
        json: (s, indent) => JSON.stringify(s, null, indent || 0),
    })

    const _normalize = function (s, is_final) {
        if (s === undefined) {
            return ""
        } else if (s === null) {
            return ""
        } else if (is_final && !_.is.String(s)) {
            return "" + s
        } else {
            return s
        }
    }

    const _pipe = function (value, expression) {
        var match = expression.match(/^:(.*)$/)
        if (match) {
            return fd["default"](value, match[1])
        }

        match = expression.match(/^([-A-Za-z0-9_]+)([(]([^]*)[)])?/)
        if (!match) {
            throw new Error("bad pipe expression: " + expression)
        }

        const fname = match[1]
        const f = _.d.get(fd, fname)
        if (!f) {
            throw new Error("bad pipe function - not found: " + fname)
        }

        var inners = []
        if (match[3]) {
            inners = JSON.parse("[" + match[3].replace(/'/g, '"') + "]")
        }

        inners.splice(0, 0, value)

        return _normalize(f.apply(f, inners))
    }

    const _expression_replacer = function (match, variable) {
        const inner = variable.replace(/^\s+/, '').replace(/\s+$/, '')
        const parts = inner.split(/[|]/g)

        variable = parts[0]
        if (paramd.dotpath) {
            variable = variable.replace(/[.]/g, "/")
        }

        var value = _normalize(_.d.get(d, variable))

        parts.splice(0, 1)

        parts.map(function (part) {
            value = _pipe(value, part)
        })

        value = _normalize(value, true)

        if (paramd.clean && _.is.String(value)) {
            value = value.trim().replace(/ +/g, " ")
        }

        return value
    }

    return template.replace(/{{(.*?)}}/g, _expression_replacer)
}

/**
 *  This is similar to format, except it will walk the object
 *  looking for strings to replace
 */
const _format_object = function (template_object, d, fd, paramd) {
    return _.d.transform(template_object, {
        value: function (value, _d) {
            if (!_.is.String(value)) {
                return value
            }

            value = _format_string(value, d, fd, paramd)
            if (paramd.clean && _.is.String(value)) {
                value = value.trim().replace(/ +/g, " ")
            }

            return value
        },
    })
}

const format = function (template, d, fd, paramd) {
    paramd = paramd || {}
    paramd.dotpath = paramd.dotpath ?? false

    if (_.is.String(template)) {
        return _format_string(template, d, fd, paramd)
    } else {
        return _format_object(template, d, fd, paramd)
    }
}

const format_dotpath = function (template, d, fd, paramd) {
    paramd = paramd || {}
    paramd.dotpath = paramd.dotpath ?? true

    if (_.is.String(template)) {
        return _format_string(template, d, fd, paramd)
    } else {
        return _format_object(template, d, fd, paramd)
    }
}

/**
 *  API
 */
exports.format = format
exports.format.dotpath = format_dotpath
