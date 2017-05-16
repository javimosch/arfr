
var S = require('string');
var getFile = require('../model/utils').getFile;

function replace(html, params) {
    html = S(html);
    for (var x in params) {
        //console.log('EMAIL:REPLACE:'+x+':'+params[x]);
        html = html.replaceAll(x, params[x]);
    }
    return html.s;
}

function template(n, replaceParams) {
    var html = getFile('../templates/' + n + '.html');
    if (replaceParams) {
        html = replace(html, replaceParams);
        //console.log('EMAIL:REPLACE:',html);
    }
    return html;
}


module.exports = template;