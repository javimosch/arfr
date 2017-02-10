var name = 'task:mongoritoTest';
var _ = require('lodash');
var moment = require('moment');
var User = require('../backend-mongoose-wrapper').create('User');
var Order = require('../backend-mongoose-wrapper').create('Order');
var Log = require('../backend-mongoose-wrapper').create('Log');
var Email = require('../../controllers/ctrl.email');
var Notif = require('../../controllers/ctrl.notification');
var NOTIFICATION = Notif.NOTIFICATION;
var log = (m) => {
    console.log(name + ': ' + m);
    return name + ': ' + m;
}
var dblog = (msg, type) => Log.save({
    message: msg,
    type: type
});


var co = require('co');
var Mongorito = require('mongorito');
var Model = Mongorito.Model;
var MONGOOSE_URI = require('../backend-database').dbURI;

function handler(data, cb) {

console.log('DEBUG: mongorito handler');

co(function*() {
    "use strict"

    class Post extends Model {

    }

    console.log('DEBUG: conectando ....');
    yield Mongorito.connect(MONGOOSE_URI);
    console.log('DEBUG: contectado.');

    function* createPost() {
        console.log('DEBUG: creando post');
        var post = new Post({
            title: 'Node.js with --harmony rocks!',
            body: 'Long post body',
            author: {
                name: 'John Doe'
            },
            comments: []
        });
        post.set('age', 22);
        yield post.save();
        console.log('DEBUG: creado post ',post);
    }


    yield createPost();

}).catch(onerror);

function onerror(err) {
    // log any uncaught errors
    // co will not throw any errors you do not handle!!!
    // HANDLE ALL YOUR ERRORS!!!
    console.error(err.stack);
}

   
}





module.exports = {
    name: name,
    interval: 1000 * 60 * 60, //each hour
    handler: handler,
    startupInterval: false,
    startupIntervalDelay:4000
};
