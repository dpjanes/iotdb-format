/*
 *  test/test_dotpath_string.js
 *
 *  David Janes
 *  IOTDB.org
 *  2017-11-28
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

"use strict";

const format = require("..")
const assert = require("assert");

const d = {
    phrase: "Replacement String",
    integer: 123,
    number: 3.14159,
    something: {
        a: "some value",
        b: [ 1, 2, 3, 5],
    }
}

// console.log(format("a string", d));
// console.log(format.format.dotpath("{{ something|json }}", d));
// console.log(format.format.dotpath("{{ something|json(2) }}", d));
//

describe("format string", function() {
    it("pass-thru", function() {
        const result = format.format.dotpath("be.fo/re a.ft/er", d);
        const expected = "be.fo/re a.ft/er";

        assert.deepEqual(expected, result);
    })
    it("replaces", function() {
        const result = format.format.dotpath("be.fo/re {{ phrase }} a.ft/er", d);
        const expected = "be.fo/re Replacement String a.ft/er";

        assert.deepEqual(expected, result);
    })
    it("replaces(upper)", function() {
        const result = format.format.dotpath("be.fo/re {{ phrase|upper) }} a.ft/er", d);
        const expected = "be.fo/re REPLACEMENT STRING a.ft/er";

        assert.deepEqual(expected, result);
    })
    // note that slashpaths continue to work
    it("replaces-with-slashpath(upper)", function() {
        const result = format.format.dotpath("be.fo/re {{ something/a|upper) }} a.ft/er", d);
        const expected = "be.fo/re SOME VALUE a.ft/er";

        assert.deepEqual(expected, result);
    })
    it("replaces-with-dotpath(upper)", function() {
        const result = format.format.dotpath("be.fo/re {{ something.a|upper) }} a.ft/er", d);
        const expected = "be.fo/re SOME VALUE a.ft/er";

        assert.deepEqual(expected, result);
    })
    it("replaces(lower)", function() {
        const result = format.format.dotpath("be.fo/re {{ phrase|lower) }} a.ft/er", d);
        const expected = "be.fo/re replacement string a.ft/er";

        assert.deepEqual(expected, result);
    })
    it("replaces(upper|lower)", function() {
        const result = format.format.dotpath("be.fo/re {{ phrase|upper|lower(34) }} a.ft/er", d);
        const expected = "be.fo/re replacement string a.ft/er";

        assert.deepEqual(expected, result);
    })
    it("replaces(default)", function() {
        const result = format.format.dotpath('be.fo/re {{ xxx|default("hi there") }} a.ft/er', d);
        const expected = "be.fo/re hi there a.ft/er";

        assert.deepEqual(expected, result);
    })
    it("replaces(default|upper)", function() {
        const result = format.format.dotpath('be.fo/re {{ xxx|:hi there|upper }} a.ft/er', d);
        const expected = "be.fo/re HI THERE a.ft/er";

        assert.deepEqual(expected, result);
    })
    it("replaces(default-not-used|upper)", function() {
        const result = format.format.dotpath('be.fo/re {{ phrase|:hi there|upper }} a.ft/er', d);
        const expected = "be.fo/re REPLACEMENT STRING a.ft/er";

        assert.deepEqual(expected, result);
    })
    it("replaces(binary)", function() {
        const result = format.format.dotpath('be.fo/re {{ phrase|binary("false", "true") }} a.ft/er', d);
        const expected = "be.fo/re true a.ft/er";

        assert.deepEqual(expected, result);
    })
})
