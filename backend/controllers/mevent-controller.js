var Mongorito = require('mongorito');
//var MEvent = require('../model/mongorito-schemas').MEvent;
var co = require('co');
var MONGOOSE_URI = require('../model/backend-database').dbURI;

module.exports = {
   // test: test
}

/*
function test(data,cb) {
    co(function*() {
        "use strict"
        
        console.log('DEBUG: conectando ....');
        yield Mongorito.connect(MONGOOSE_URI);
        console.log('DEBUG: contectado.');

        function* createPost() {
            console.log('DEBUG: creando post');
            var post = new MEvent({
                title: 'Node.js with --harmony rocks!',
                body: 'Long post body',
                author: {
                    name: 'John Doe'
                },
                comments: []
            });
            post.set('age', 22);
            yield post.save();
            console.log('DEBUG: creado post ', post);
        }


        yield createPost();
        
        yield Mongorito.disconnect();

    }).catch(cb);
}*/
