"use strict";
let co = require("co");
var firebase = require("firebase-admin");
var fs = require('fs');
var ref, appName, fireApp;
var path =require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var heConfig = resolver.handlebarsContext();
var heUtils = require('./utils');
var urlencode = require('urlencode');

var util = require('util');
var moment = require('moment');

var logger = resolver.logger().get('SERVER','GENERATOR-FIREBAE');


module.exports = {
    init: (data) => {

        function serviceAccount() {
            var rta = process.cwd() + "/" + (data.serviceAccount || 'getabiker-0950b8f9f7c8.json')
            logger.debug('URL', rta);
            return rta;
        }


        appName = data.appName;
        fireApp = firebase.initializeApp({
            //serviceAccount: serviceAccount(),
            credential: firebase.credential.cert(serviceAccount()),
            databaseURL: data.databaseURL || "https://getabiker-1276e.firebaseio.com"
        });

        data.signalName = data.signalName || data.appName;
        
        logger.debug('signalName', data.signalName);

        

        if (!data.signalName) {
            return logger.warn('cannot identify signalName or appName');
        }

        require('getmac').getMac(function(err, macAddress) {
            if (err) throw err
            logger.debug('MAC -> ' + macAddress)
        })

        if (data.serviceAccount) {
            ref = fireApp.database().ref('/bastack');
        }
        else {
            ref = fireApp.database().ref(data.signalName || data.appName);
        }
        
        ref.child('overview').set({
            start: Date.now()
        });
    

        //fireApp.database().ref('/admin/partials').remove();

        co(function*() {
            let rootRef = fireApp.database().ref('/bastack')
            let rootSnap = yield rootRef.once('value');

            if (!rootSnap.exists()) {
                yield rootRef.set({
                    partials: null,
                    signals:null,
                    createdAt: Date.now()
                });
            }

            //logger.debug('WATCH ROOT',root.val())
        }).catch((err) => {
            logger.warn('Catch', err);
        });


    },
    sendSignal: (evt, extraPayload) => {
        var payload = {};
        var now = new Date().getTime();
        payload[evt] = now;

        for (var x in extraPayload) {
            payload[x] = extraPayload[x];
        }

        ref.child('signals').set(payload);
        logger.debug('sending signal to ' + heConfig().signalName || heConfig().appName, JSON.stringify(payload));
        logger.debug('WAITING CHANGES');
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
                //logger.debug('DATABASE (FIREBASE):', fileName, mtime);

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
                //logger.debug('DB: Partial set', fileName);
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
                    //    logger.debug('DB: Partial upload skip ', fileName);
                    // }
                    // else {
                    yield setPartial(false);
                    // }

                }
            }



            //logger.debug('TYPEOF ',ref);

        }).catch(function(err) {
            logger.debug(err);
        });



        //logger.debug('DATABASE (FIREBASE):: sending partial ', fileName);





        return;
        try {
            var ref = fireApp.database().ref('/admin/partials');

            var data = {};
            var id = (appName + '_' + fileName);
            //logger.debug('DATABASE: ID 1',id);
            id = id.split('.').join('__');
            //logger.debug('DATABASE: ID 2',id);
            data[id] = {
                fileName: fileName,
                content: urlencode(content)
            };
            ref.update(data);
        }
        catch (e) {
            logger.error('sending partial error', e);
        }
        //logger.debug('DEBUG: successs for partial ', fullPath);



    }
}
