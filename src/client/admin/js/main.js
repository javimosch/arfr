"use strict";
import "babel-polyfill";
import "./routes";
import resolver from "../../common/js/resolver";

resolver.co.wrap(function*() {


    //Configuration phase
    resolver.angularModules.appModule.configure({
        routes: [
            ['/', "/includes/default.html"],
            ['default', '/']
        ]
    });

    //Boostrap
    yield resolver.angularModules.appModule.bootstrap();


    return Promise.resolve('Bootstrap success');
})().then(console.info);
