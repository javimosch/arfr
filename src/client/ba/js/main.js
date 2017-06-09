"use strict";
import "babel-polyfill";
import resolver from "../../common/js/resolver";

resolver.co.wrap(function*() {


    //Configuration phase
    resolver.angularModules.appModule.configure({
        routes: [
            ['/default', "/includes/default.html"],
            ['default', '/default']
        ]
    });

    //Boostrap
    yield resolver.angularModules.appModule.bootstrap();


    return Promise.resolve('Bootstrap success');
})().then(console.info);
