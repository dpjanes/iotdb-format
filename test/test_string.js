var format = require('../format').format;

var d = {
    phrase: "Replacement String",
    integer: 123,
    number: 3.14159,
    something: {
        a: "a",
        b: [ 1, 2, 3, 5],
    }
}

// console.log(format("a string", d));
console.log(format("{{ phrase }}", d));
console.log(format("{{ phrase|upper) }}", d));
console.log(format("{{ phrase|lower) }}", d));
console.log(format("{{ phrase|upper|lower(34) }}", d));
console.log(format('{{ xxx|default("hi there") }}', d));
console.log(format('{{ xxx|:hi there|upper }}', d));
console.log(format('{{ phrase|:hi there|upper }}', d));
console.log(format('{{ phrase|binary("false", "true") }}', d));
console.log(format("{{ something|json }}", d));
console.log(format("{{ something|json(2) }}", d));

