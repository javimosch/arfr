"use strict";
import "babel-polyfill";
import resolver from "../../common/js/resolver";

import {
    el,
    mount
}
from 'redom';

resolver.co.wrap(function*() {

    
    //Configuration phase
    resolver.angularModules.appModule.configure({
        routes: [
            ['/clients', "/includes/clients.html"],
            ['default', '/clients']
        ]
    });

    //Boostrap
    yield resolver.angularModules.appModule.bootstrap();

    //const hello = el('h1', 'Hello RE:DOM!');
    //mount(document.querySelector('.view-wrapper'), hello);


    return Promise.resolve('Bootstrap success');
})().then(console.info);
