"use strict"
var Project = require('../model/mongorito-schemas').Project;
var db = require('../model/backend-database');
db.Mongorito.connect(db.dbURI);

module.exports = {
    saveProject: saveProject
}

function copyValues(modelInstance, data, keys) {
    for (var x in keys) {
        if (data[keys[x]] != undefined) {
            modelInstance.set(keys[x], data[keys[x]]);
        }
    }
}

function* createUpdate(model, data, editables, cb) {
    if (data._id) {
        //save by id
        var item = yield model.findOne({
            _id: data._id
        });
        if (item) {
            var item = yield model.findOne({
                _id: data._id
            });
            copyValues(item, data, editables);
            yield item.save();
            return cb(null, item.get());
        }
        else {
            return cb({
                message: 'Account not found ',
                _id: data._id,
                item: item
            });
        }
    }
    else {
        //match by name
        var count = yield model.count({
            name: data.name
        });
        if (count >= 1) {
            var item = yield model.findOne({
                name: data.name
            });
            copyValues(item, data, editables);
            yield item.save();
            return cb(null, item.get());
        }
        else {
            //Create new
            var item = new model(data);
            yield item.save();
            return cb(null, item);
        }
    }
}

function saveProject(data, cb) {
    if (!data.name) return cb('name required');
    if (!data.short_description) return cb('short_description required');
    var editables = ['name', 'short_description', 'description'];
    db.co(function*() {
        yield createUpdate(Project, data, editables, cb);
    }).catch(cb);
}
