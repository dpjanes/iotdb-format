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

var iotdb = require('iotdb');
var _ = iotdb._;
var logger = iotdb.logger({
    name: "iotdb-commands",
    module: "format",
});

var format = function(template, d, fd) {
    d = _.d.compose.shallow(d, {
    });
    fd = _.d.compose.shallow(fd, {
        upper: function(s) {
            return s.toUpperCase();
        },
        lower: function(s) {
            return s.toLowerCase();
        },
        binary: function(s, for_false, for_true) {
            return _.is.Empty(s) ? for_false : for_true;
        },
        'default': function(s, otherwise) {
            return (s.length === 0) ? otherwise : s;
        },
    });

    var _normalize = function(s, is_final) {
        if (s === undefined) {
            return "";
        } else if (s === null) {
            return "";
        } else if (is_final && !_.is.String(s)) {
            return "" + s;
        } else {
            return s
        }
    };

    var _pipe = function(value, expression) {
        var match = expression.match(/^([-A-Za-z0-9_]+)([(]([^]*)[)])?/);
        if (!match) {
            throw new Error("bad pipe expression: " + expression);
        }

        var fname = match[1];
        var f = fd[fname];
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

    var _expression_replacer = function(match, variable) {
        var inner = variable.replace(/^\s+/, '').replace(/\s+$/, '');
        var parts = inner.split(/[|]/g);

        var variable = parts[0];
        var value = _normalize(d[variable]);

        parts.splice(0, 1);

        parts.map(function(part) {
            value = _pipe(value, part);
        });

        return _normalize(value, true);

    };

    return template.replace(/{{(.*?)}}/g, _expression_replacer);
};

/**
 *  API
 */
exports.format = format;
