var format = require('../format').format;

var d = {
    deep: {
        phrase: "Replacement String",
        integer: 123,
        number: 3.14159,
    }
}

// console.log(format("a string", d));
console.log(format("{{ /deep/phrase }}", d));
console.log(format("{{ /deep/phrase|upper) }}", d));
console.log(format("{{ /deep/phrase|lower) }}", d));
console.log(format("{{ /deep/phrase|upper|lower(34) }}", d));
console.log(format('{{ /deep/xxx|default("hi there") }}', d));
console.log(format('{{ /deep/xxx|:hi there|upper }}', d));
console.log(format('{{ deep/phrase|:hi there|upper }}', d));
console.log(format('{{ deep/phrase|binary("false", "true") }}', d));

