/*
 *  test/test_string.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-09-23
 *
 *  Copyright [2013-2018] [David P. Janes]
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

const format = require("..")
const assert = require("assert");

const d = {
    deep: {
        phrase: "Replacement String",
        integer: 123,
        number: 3.14159,
    }
}

describe("deep", function() {
    describe("finds string", function() {
        it("finds", function() {
            const result = format.format("{{ /deep/phrase }}", d);
            const expected = "Replacement String";

            assert.deepEqual(expected, result);
        })
        it("finds | upper", function() {
            const result = format.format("{{ /deep/phrase|upper) }}", d);
            const expected = "REPLACEMENT STRING";

            assert.deepEqual(expected, result);
        })
        it("finds | lower", function() {
            const result = format.format("{{ /deep/phrase|lower) }}", d);
            const expected = "replacement string";

            assert.deepEqual(expected, result);
        })
        it("finds | lower | lower", function() {
            const result = format.format("{{ /deep/phrase|upper|lower(34) }}", d);
            const expected = "replacement string";

            assert.deepEqual(expected, result);
        })
        it("doesn't find | default", function() {
            const result = format.format('{{ /deep/xxx|default("hi there") }}', d);
            const expected = "hi there";

            assert.deepEqual(expected, result);
        })
        it("doesn't find | :default | upper", function() {
            const result = format.format('{{ /deep/xxx|:hi there|upper }}', d);
            const expected = "HI THERE";

            assert.deepEqual(expected, result);
        })
        it("find - no leading slash", function() {
            const result = format.format('{{ deep/phrase|:hi there|upper }}', d);
            const expected = "REPLACEMENT STRING";

            assert.deepEqual(expected, result);
        })
        it("find | binary", function() {
            const result = format.format('{{ deep/phrase|binary("false", "true") }}', d);
            const expected = "true";

            assert.deepEqual(expected, result);
        })
    })
})
