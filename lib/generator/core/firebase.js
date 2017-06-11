"use strict";
let co = require("co");
var firebase = require("firebase-admin");
var ref, appName, fireApp;
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var heUtils = require('./utils');
var urlencode = require('urlencode');
var btoa = require('btoa');
var util = require('util');
var logger = resolver.logger().get('GENERATOR', 'FIREBASE');


var self = module.exports = {
    init: (data) => {
        
        if(!data.firebase){
            return logger.debugError('Configure context firebase property');
        }

        function serviceAccount() {
            var rta = process.cwd() + "/" + (data.firebase && data.firebase.serviceAccount);
            logger.debugTerminal('URL', rta);
            return rta;
        }

        fireApp = firebase.initializeApp({
            credential: firebase.credential.cert(serviceAccount()),
            databaseURL: data.firebase.databaseURL
        });

        var rootPath = data.firebase.rootPath;

        logger.debugTerminal('rootPath', rootPath);



        if (!rootPath) {
            return logger.warn('cannot identify rootPath or appName');
        }

        require('getmac').getMac(function(err, macAddress) {
            if (err) throw err;
            logger.debugTerminal('MAC -> ' + macAddress);
        });

        if (data.serviceAccount) {
            ref = fireApp.database().ref('/bastack');
        }
        else {
            ref = fireApp.database().ref(rootPath || data.appName);
        }

        ref.child('overview').set({
            start: Date.now()
        });


        //fireApp.database().ref('/admin/partials').remove();

        let rootRef = fireApp.database().ref('/bastack');
        co(function*() {
            yield rootRef.set({
                partials: null,
                signals: null,
                createdAt: Date.now()
            });

            let rootSnap = yield rootRef.once('value');
            logger.debugTerminal('WATCH ROOT', rootSnap.val());

            rootRef.child('reports/currentPages').on("value", function(snap, prevChildKey) {
                var arr = Object.keys(snap.val() || {}).map(k => snap.val()[k]);
                self.currentPages = arr;
                logger.debugTerminal('(watch) reports/currentPages', arr);
            });

        }).catch((err) => {
            logger.warn('Catch', err);
        });

        self.sendHotHtml = function(pathname, html) {
            return resolver.coWrapExec(function*() {
                yield rootRef.child('signals/hot_html/' + pathname).set(urlencode(html));
                return resolver.Promise.resolve(true);
            });
        };
        self.sendHotScript = function(js) {
            logger.debugTerminal('sendHotScript', js.length);
            return resolver.coWrapExec(function*() {
                if (js.length > 0) {
                    yield rootRef.child('signals/hot_js').set(btoa(js));
                }
                logger.debugTerminal('sendHotScript', js.length);
                return resolver.Promise.resolve(true);
            }).catch(logger.errorTerminal);
        };



    },
    sendSignal: (evt, extraPayload) => {
        var payload = {};
        var now = new Date().getTime();
        payload[evt] = now;

        for (var x in extraPayload) {
            payload[x] = extraPayload[x];
        }

        ref.child('signals').set(payload);
        //logger.debugTerminal('sending signal to ' + heConfig().rootPath || heConfig().appName, JSON.stringify(payload));
        logger.debugTerminal('Sending', Object.keys(payload));
        logger.debugTerminal('WAITING CHANGES');
    },
    getPartialContent: function*(fileName) {
        var partialKey = (appName + '_' + fileName).split('.').join('__');
        let data = yield fireApp.database().ref('/admin/partials/' + partialKey).once('value')
        return data && data.exists() && data.val();
    },
    sendPartial: (fileName, content, fullPath) => {
        if (!appName) {
            return logger.warn('sendPartial appName null');
        }

        co(function*() {

            let file = yield heUtils.fileStat(fullPath);
            if (file.err) return logger.warn('WARN:', file.err, 'PATH', process.cwd(), fullPath);
            var mtime = new Date(util.inspect(file.stats.mtime))
                //logger.debugTerminal('DATABASE (FIREBASE):', fileName, mtime);

            var partialKey = (appName + '_' + fileName).split('.').join('__');
            var partialPayload = {
                key: partialKey,
                fileName: fileName,
                fullPath: fullPath,
                content: urlencode(content),
                updatedAt: mtime
            };

            let partialsRef = fireApp.database().ref('/admin/partials')
            let partialsSnap = yield partialsRef.once('value');

            function* setPartial(isNew) {
                if (isNew) {
                    partialPayload.createdAt = Date.now();
                }
                yield partialsRef.update({
                    [partialKey]: partialPayload
                });
                //logger.debugTerminal('DB: Partial set', fileName);
            }

            if (!partialsSnap.exists()) {
                yield setPartial(true);
            }
            else {
                let partialRef = fireApp.database().ref('/admin/partials/' + partialKey);
                let partialSnap = yield partialRef.once('value');
                if (!partialSnap.exists()) {
                    yield setPartial(true);
                }
                else {
                    let partialVal = partialSnap.val();
                    // if (partialVal.updatedAt && moment(partialVal.updatedAt).isAfter(moment(mtime))) {
                    //    logger.debugTerminal('DB: Partial upload skip ', fileName);
                    // }
                    // else {
                    yield setPartial(false);
                    // }

                }
            }



            //logger.debugTerminal('TYPEOF ',ref);

        }).catch(function(err) {
            logger.debugTerminal(err);
        });



        //logger.debugTerminal('DATABASE (FIREBASE):: sending partial ', fileName);





        return;
        try {
            var ref = fireApp.database().ref('/admin/partials');

            var data = {};
            var id = (appName + '_' + fileName);
            //logger.debugTerminal('DATABASE: ID 1',id);
            id = id.split('.').join('__');
            //logger.debugTerminal('DATABASE: ID 2',id);
            data[id] = {
                fileName: fileName,
                content: urlencode(content)
            };
            ref.update(data);
        }
        catch (e) {
            logger.error('sending partial error', e);
        }
        //logger.debugTerminal('DEBUG: successs for partial ', fullPath);



    }
}
