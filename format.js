/*
 *  format.js
 *
 *  David Janes
 *  IOTDB.org
 *  206-01-09
 *
 *  Copyright [2013-2016] [David P. Janes]
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

"use strict";

const iotdb = require('iotdb');
const _ = iotdb._;

const logger = iotdb.logger({
    name: "iotdb-format",
    module: "format",
});

var format;

/**
 *  LOTS OF WORK NEEDED FOR NON-STRINGS: REFERENCE DJANGO
 */
const _format_string = function (template, d, fd) {
    d = _.d.compose.shallow(d, {});
    fd = _.d.compose.shallow(fd, {
        upper: s => s.toUpperCase(),
        lower: s => s.toLowerCase(),
        binary: (s, for_false, for_true) => _.coerce.to.Boolean(s, false) ? for_true : for_false,
        'default': (s, otherwise) => (s.length === 0) ? otherwise : s,
    });

    const _normalize = function (s, is_final) {
        if (s === undefined) {
            return "";
        } else if (s === null) {
            return "";
        } else if (is_final && !_.is.String(s)) {
            return "" + s;
        } else {
            return s;
        }
    };

    const _pipe = function (value, expression) {
        var match = expression.match(/^:(.*)$/);
        if (match) {
            return fd["default"](value, match[1]);
        }

        match = expression.match(/^([-A-Za-z0-9_]+)([(]([^]*)[)])?/);
        if (!match) {
            throw new Error("bad pipe expression: " + expression);
        }

        const fname = match[1];
        const f = _.d.get(fd, fname);
        if (!f) {
            throw new Error("bad pipe function - not found: " + fname);
        }

        var inners = [];
        if (match[3]) {
            inners = JSON.parse("[" + match[3].replace(/'/g, '"') + "]");
        }

        inners.splice(0, 0, value);

        return _normalize(f.apply(f, inners));
    };

    const _expression_replacer = function (match, variable) {
        const inner = variable.replace(/^\s+/, '').replace(/\s+$/, '');
        const parts = inner.split(/[|]/g);
        variable = parts[0];
        var value = _normalize(_.d.get(d, variable));

        parts.splice(0, 1);

        parts.map(function (part) {
            value = _pipe(value, part);
        });

        return _normalize(value, true);

    };

    return template.replace(/{{(.*?)}}/g, _expression_replacer);
};

/**
 *  This is similar to format, except it will walk the object
 *  looking for strings to replace
 */
const _format_object = function (template_object, d, fd) {
    return _.d.transform(template_object, {
        value: function (value, paramd) {
            if (!_.is.String(value)) {
                return value;
            }

            return format(value, d, fd);
        },
    });
};

var format = function (template, d, fd) {
    if (_.is.String(template)) {
        return _format_string(template, d, fd);
    } else {
        return _format_object(template, d, fd);
    }
};

/**
 *  API
 */
exports.format = format;
