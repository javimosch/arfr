"use strict";
import "babel-polyfill";
import "./routes";
import co from "co";
var a = 1;


var asd = co.wrap(function*(){
    return Promise.resolve('HOLA  4!');
})();


console.log(a);
console.log(asd.then(console.info));