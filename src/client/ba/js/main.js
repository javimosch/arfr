"use strict";
import "babel-polyfill";
import co from "co";
import angular from "angular";

var asd = co.wrap(function*(){
    return Promise.resolve('HOLA  4!');
})();



console.log(typeof angular.module);
asd.then(console.info);
