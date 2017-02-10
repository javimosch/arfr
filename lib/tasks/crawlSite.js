"use strict";

let co = require("co");
let request = require("co-request");
var querySelectorAll = require('query-selector');
var jsdom = require("jsdom").jsdom;
var _ = require('lodash');
var path = require('path');

co(function*() {


    function* nextBody(url) {
        if(!url){
            console.log('nextBody','no-url');
            return '';
        }
        //console.log('nextBody',url);
        let result = yield request(url);
        //console.log('nextBody',result.length);
        let response = result;
        let body = result.body;
        return body;
    }


    function getInnerHTML(selector, doc) {
        var result = doc.querySelectorAll(selector);
        if (result) return result[0].innerHTML;
        return '';
    }

    function getInnerHTMLAll(selector, doc) {
        //console.log('getInnerHTMLAll init')
        var rta = [];
        var result = doc.querySelectorAll(selector);
        if (result) {
            //console.log('getInnerHTMLAll result len', result.length);
            _.each(result, (node) => {
                //console.log('reading ', node.innerHTML);
                rta.push(node.innerHTML);
            });
        }
        return rta;
    }

    function getAttrAll(selector, attributeName, doc) {
        var rta = [];
        var result = doc.querySelectorAll(selector);
        if (result) {
            //console.log('getAttrAll',selector,attributeName,'RESULT',result.length,doc);
            _.each(result, (node) => {
                //console.log('reading',node.getAttribute(attributeName))
                rta.push(node.getAttribute(attributeName));
            });
        }
        //console.log('getAttrAll',selector,attributeName,rta.length);
        return rta;
    }

    function uniq(a) {
        var seen = {};
        return a.filter(function(item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    }

    //return console.log(JSON.stringify( uniq([1,1,2])));

    function* crawlQuo() {
        var root = 'http://www.quo.es';
        var categories = ['salud', 'ser-humano', 'tecnologia', 'ciencia'];

        var articlesUrls = [];

        function* crawlArticle(subPath) {
            console.log('1.1');
            var body = yield nextBody(root + subPath);
            console.log('1.2');
            var mainDoc = jsdom(body);
            console.log('1.3');
            //console.log('ARTICLE ->', getInnerHTML('.titulo', mainDoc));
            //console.log('subtitle', getInnerHTML('.entradilla p'));
            var article = getInnerHTML('#articulo', mainDoc);
            console.log('1.4');
            article = jsdom(article);
            console.log('1.5');
            //console.log('article', JSON.stringify(getInnerHTMLAll('p', article)));
            var links = uniq(getAttrAll('.moduloTres a', 'href', mainDoc));

            yield crawlArticle(links[0]);

            //links = JSON.stringify(links);
            //console.log('1.6');
            //console.log(links);
        }

        function* crawlCategory(categoryName) {
            console.log('crawlCategory',categoryName)
            //console.log('crawlCategory',path.join(root, 'tecnologia'));
            var body = yield nextBody(root+'/categoryName');
            //console.log('crawlCategory',categoryName,body.indexOf('mainContent'));
            var mainDoc = jsdom(body);
            var links = uniq(getAttrAll('#wrapper a', 'href', mainDoc));
            //console.log('crawlCategory',categoryName,links)
            for (var x in links) {
                articlesUrls.push(links[x]);
            }
            articlesUrls = uniq(articlesUrls);
        }
        
        function* crawlCategories(){
            for(var x in categories){
                yield crawlCategory(categories[x]);
            }
        }

        
        console.log('1.-1')
        //yield crawlArticle("/naturaleza/los-caballos-pueden-aprender-a-usar-simbolos-para-comunicarse");
        yield crawlCategories();
        //yield crawlCategory(categories[0]);
        console.log('articles found',articlesUrls.length, JSON.stringify(articlesUrls));
    }

    console.log('1');
    yield crawlQuo();
    console.log('2');



}).catch(function(err) {
    console.err(err);
});
