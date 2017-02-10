"use strict";
let co = require("co");
var firebase = require("firebase-admin");
var fs = require('fs');
var ref, appName, fireApp;
var heConfig = require('../config');
var heUtils = require('./utils');
var urlencode = require('urlencode');
var path = require('path');
var util = require('util');
var moment = require('moment');




module.exports = {
    init: (data) => {

        function serviceAccount() {
            var rta = process.cwd() + "/" + (data.serviceAccount || 'getabiker-0950b8f9f7c8.json')
            console.log('LIVE-SYNC URL', rta);
            return rta;
        }


        appName = data.appName;
        fireApp = firebase.initializeApp({
            //serviceAccount: serviceAccount(),
            credential: firebase.credential.cert(serviceAccount()),
            databaseURL: data.databaseURL || "https://getabiker-1276e.firebaseio.com"
        });

        data.signalName = data.signalName || data.appName;
        
        console.log('LIVE-SYNC: firebase signalName', data.signalName);

        

        if (!data.signalName) {
            return console.log('WARN: LIVE-SYNC firebase cannot identify signalName or appName');
        }

        require('getmac').getMac(function(err, macAddress) {
            if (err) throw err
            console.log('LIVE-SYNC: MAC -> ' + macAddress)
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

            //console.log('WATCH ROOT',root.val())
        }).catch((err) => {
            console.log('WARN:', err);
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
        console.log('LIVE-SYNC: sending signal to ' + heConfig().signalName || heConfig().appName, JSON.stringify(payload));
        console.log('LIVE-SYNC: WAITING CHANGES');
    },
    getPartialContent: function*(fileName) {
        var partialKey = (appName + '_' + fileName).split('.').join('__');
        let data = yield fireApp.database().ref('/admin/partials/' + partialKey).once('value')
        return data && data.exists() && data.val();
    },
    sendPartial: (fileName, content, fullPath) => {
        if (!appName) {
            return console.log('WARN: DATABASE (FIREBASE) sendPartial appName null');
        }

        co(function*() {

            let file = yield heUtils.fileStat(fullPath);
            if (file.err) return console.log('WARN:', file.err, 'PATH', process.cwd(), fullPath);
            var mtime = new Date(util.inspect(file.stats.mtime))
                //console.log('DATABASE (FIREBASE):', fileName, mtime);

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
                //console.log('DB: Partial set', fileName);
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
                    //    console.log('DB: Partial upload skip ', fileName);
                    // }
                    // else {
                    yield setPartial(false);
                    // }

                }
            }



            //console.log('TYPEOF ',ref);

        }).catch(function(err) {
            console.log(err);
        });



        //console.log('DATABASE (FIREBASE):: sending partial ', fileName);





        return;
        try {
            var ref = fireApp.database().ref('/admin/partials');

            var data = {};
            var id = (appName + '_' + fileName);
            //console.log('DATABASE: ID 1',id);
            id = id.split('.').join('__');
            //console.log('DATABASE: ID 2',id);
            data[id] = {
                fileName: fileName,
                content: urlencode(content)
            };
            ref.update(data);
        }
        catch (e) {
            console.log('DATABASE (FIREBASE): sending partial error', e);
        }
        //console.log('DEBUG: successs for partial ', fullPath);



    }
}
