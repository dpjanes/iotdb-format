# iotdb-format
Yet another bloody module: simple, somewhat powerful, string formatting

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-iotdb/master/docs/HomeStar.png" align="right" />

This isn't really finished: it needs a proper grammar, maybe using JISON.


## Format Strings

    const iotdb_format = require('iotdb-format')
    const d = {
        message: "Hello, World"
    }

    iotdb_format.format("{{ message }}") // "Hello World"
    iotdb_format.format("{{ message|upper }}") // "HELLO WORLD"
    iotdb_format.format("{{ xmessage|:Something Else }}") // "Something Else"
    iotdb_format.format("{{ xmessage|:Something Else|lower }}") // "something else"


## Format Objects

    const iotdb_format = require('iotdb-format')
    const d = {
        msg: {
            hello: "Hello",
            world: "World",
        }
    }

    iotdb_format.format({
        list: [ "{{ msg/hello }}", "{{ msg/comma|:, }}", "{{ msg/world|upper }}", 3.14 ]
    }, d)

    // result: { list: [ 'Hello', ',', 'WORLD', 3.14 ] }

