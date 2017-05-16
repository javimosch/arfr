var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var snake = require('to-snake-case');


exports.replaceAll = replaceAll;
exports.convertSnakeCaseMiddleToCamelCase = convertSnakeCaseMiddleToCamelCase;
exports.stringToSnakeCaseMiddle = stringToSnakeCaseMiddle;

function convertSnakeCaseMiddleToCamelCase(n) {
    var pos = n.indexOf('-');
    if (pos == -1) {
        return n;
    }
    else {
        n = n.substring(0, pos) + n.substring(pos + 1, pos + 2).toUpperCase() + n.substring(pos + 2);
        return convertSnakeCaseMiddleToCamelCase(n);
    }
}


function stringToSnakeCaseMiddle(str) {
    return replaceAll(snake(str), '_', '-');
}

function replaceAll(word, search, replacement) {
    return word.replace(new RegExp(search, 'g'), replacement);
};


