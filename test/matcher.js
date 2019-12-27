/*
 *  test/matcher.js
 *
 *  David Janes
 *  IOTDB.org
 *  2019-12-26
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

const format = require("..")
const assert = require("assert")

describe("matcher", function() {
    const m = format.matcher("{{ length }} mm / {{ width }} mm / {{ height }} mm", {
        patterns: {
            length: /\d+/,
            width: /\d+/,
            height: /\d+/,
        },
        otherwise: {
            length: "<length>",
            width: "<width>",
            height: "<height>",
        },
    })

    // console.log(m("10mm/20mm"))
    // console.log(m(""))
    // console.log(m("no match"))
    describe("works", function() {
        it("empty string", function() {
            const got = m("")
            const want = {
                "length": "<length>",
                "width": "<width>",
                "height": "<height>",
                "_matched": true
            }

            // console.log(JSON.stringify(got, null, 2))
            assert.deepEqual(want, got)
        })
        it("1 match", function() {
            const got = m("10 mm")
            const want = {
                "length": "10",
                "width": "<width>",
                "height": "<height>",
                "_matched": true
            }

            // console.log(JSON.stringify(got, null, 2))
            assert.deepEqual(want, got)
        })
        it("2 match", function() {
            const got = m("10 mm   / 20")
            const want = {
                "length": "10",
                "width": "20",
                "height": "<height>",
                "_matched": true
            }

            // console.log(JSON.stringify(got, null, 2))
            assert.deepEqual(want, got)
        })
        it("3 match", function() {
            const got = m("10 mm   / 20  mm / 1")
            const want = {
                "length": "10",
                "width": "20",
                "height": "1",
                "_matched": true
            }

            // console.log(JSON.stringify(got, null, 2))
            assert.deepEqual(want, got)
        })
        it("match total fail", function() {
            const got = m("no match")
            const want = {
                "length": "<length>",
                "width": "<width>",
                "height": "<height>",
                "_matched": false
            }

            // console.log(JSON.stringify(got, null, 2))
            assert.deepEqual(want, got)
        })
        it("match fails along the way", function() {
            const got = m("10 mm   / 20  this doesn't match")
            const want = {
                "length": "<length>",
                "width": "<width>",
                "height": "<height>",
                "_matched": false
            }

            // console.log(JSON.stringify(got, null, 2))
            assert.deepEqual(want, got)
        })
    })
})
