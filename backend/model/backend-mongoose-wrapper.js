var mongoose = require('./backend-database').mongoose;
var _ = require('lodash');
var Schema = require('./backend-database').mongoose.Schema;
var getModel = require('./backend-database').getModel;
var setModel = require('./backend-database').setModel;
var getSchema = require('./backend-database').getSchema;
var validate = require('./validator').validate;
var Promise = require('./utils').promise;
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));


var __hookData = {};
var _hook = function(schemaName, n, cb, data, index) {



    __hookData[schemaName] = __hookData[schemaName] || {}
    var _hooks = __hookData[schemaName];
    _hooks[n] = _hooks[n] || [];
    //
    if (typeof cb == 'function') {
        _hooks[n].push(cb);
        //console.log(schemaName, 'HOOK', n, 'added at', _hooks[n].length);
    }
    else {

        if (data && index) {

            var _cb = _hooks[n][index] || undefined;
            if (!_cb) {
                //console.log(schemaName, 'HOOK:RTA', JSON.stringify(data));
                return data;
            }
            else {
                console.log(schemaName, 'HOOK', n, 'fire:index:', index, '  total:', _hooks[n].length);
                data = _cb(data);
                return _hook(schemaName, n, null, data, index++);
            }
        }
        else {

            var _data = cb;
            if (_hooks[n][0]) {
                console.log(schemaName, 'HOOK', n, 'fire:index:', 0, '  total:', _hooks[n].length);
                //console.log(schemaName, 'HOOK', n, 'firing', 0);
                _data = _hooks[n][0](_data);
                return _hook(schemaName, n, null, _data, 1);
            }
            else {
                //console.log(schemaName, 'HOOK', n, 'skip');
                return _data;
            }
        }
    }
};




exports.create = function(modelName, m) {
    if (!mongoose) mongoose = m;
    var schema = null;
    var Model = getModel(modelName);
    if (Model) {
        schema = getSchema(modelName);
    }
    else {
        return {

        };
    }

    //var logger = require('./logger')(modelName.toUpperCase());

    var hook = (a, b, c, d) => {
        return _hook(modelName, a, b, c, d);
    };

    function log(x) {
        resolver.logger().get('SERVER','DATABASE').debug(Array.prototype.slice.call(arguments));
    }







    function existsById(_id, cb) {
        log('existsById=' + _id);
        Model.count(toRules({
            _id: _id
        }), (err, r) => {
            cb(err, r && r > 0);
        });
    }
    //
    function exists(data, cb) {
        Model.count(toRules(data), (err, r) => {
            log('exists=' + (r && (r > 0) || false));
            cb(err, r && (r > 0) || false);
        });
    }
    //
    function existsByField(name, val, cb) {
        //log('existsByField=' + name + ':' + val);
        var data = {};
        data[name] = val;
        Model.count(toRules(data), (err, r) => {
            log('existsByField=' + (r && r > 0));
            cb(err, r && r > 0);
        });
    }
    //

    //Sometimes, you want another model (ex: __cast operations)
    function getModelFromPayload(data) {
        if (data.__model) {
            console.log('SWITCH TO PAYLOAD MODEL', data.__model);
            return getModel(data.__model);
        }
        else {
            return Model;
        }
    }

    function createUpdate(data, cb, matchData, requiredKeys) {
        var Model = getModelFromPayload(data);
        //matchData, requiredKeys: req,res (if is being called directly)
        if (matchData && (matchData.body || matchData.params)) {
            matchData = null;
            requiredKeys = null;
        }

        if (data.__match) {
            matchData = data.__match;
            delete data.__match;
        }

        return Promise(function(resolve, error, emit) {
            check(data, requiredKeys || [], (err, r) => {
                if (err) return rta(err, null);

                matchData = matchData || {};

                if (data._id) {

                    matchData._id = data._id;
                    delete data._id;

                    /*
                    data.updatedAt = new Date();
                    var _id = data._id;
                    delete data._id;
                    data = hook('preSave', data);
                    return Model.findOneAndUpdate(toRules({
                        _id: _id
                    }), removeSpecialFields(data)).exec((err, r) => {
                        if (err) return rta(err, null);
                        if (!r) return rta(modelName + '= ' + _id + ' do not belong to any item.', null);
                        console.log('WRAPPER: SAVE UPDATE');
                        return rta(err, r);
                    });
                    */
                }


                //log('createUpdate:matchData=' + JSON.stringify(requiredKeys));

                if (matchData.length && typeof matchData !== 'string') {
                    //an array of string that represents the fields to match
                    if (matchData.filter(k => data[k] === undefined).length == 0) {
                        var _matchData = {}
                        matchData.map(key => _matchData[key] = data[key]);
                        matchData = _matchData;
                    }
                    else {
                        matchData = {};
                    }
                }

                log('createUpdate:matchData=' + JSON.stringify(matchData));

                if (Object.keys(matchData).length > 0) {
                    return Model.findOne(toRules(matchData)).exec((err, r) => {
                        if (err) return rta(err, null);
                        if (r) {
                            log('createUpdate:match:found:updating');
                            data = removeSpecialFields(data);
                            for (var x in data) {
                                r[x] = data[x];
                            }
                            data = hook('preSave', data);
                            return r.save((err, r) => {
                                emit('updated', err, r);
                                return rta(err, r);
                            });
                        }
                        else {
                            log('createUpdate:match:not-found:creating');
                            data = hook('preSave', data);
                            _create(data, (err, r) => {
                                if (err) return rta(err, null);
                                emit('created', err, r);
                                return rta(err, r);
                            }, requiredKeys);
                        }
                    })
                }
                else {
                    log('createUpdate:creating', data);
                    data = hook('preSave', data);
                    _create(data, (err, r) => {
                        if (err) return rta(err, null);
                        emit('created', err, r);
                        return rta(err, r);
                    }, requiredKeys);
                }
            });
            //
            function rta(err, r) {
                if (err) {
                    error(err);
                    if (cb) return cb(err, r);
                }
                else {
                    //log('RESOLVE SAVE',err,r);
                    resolve(r);
                    //log('createUpdate:rta' + JSON.stringify(r));
                    if (cb) return cb(err, r);
                }
            }
        });

    }

    function populate(query, p) {
        if (p.length) {
            //query = query.populate(p[0], p[1]);
            query = query.populate(p);
        }
        else {
            Object.keys(p).forEach((k) => {
                query = query.populate(k, p[k]);
            });
        }
        return query;
    }

    function getAll(data, cb) {
        cb = cb || ((_err, res) => {});
        return Promise(function(resolve, reject, emit) {

            var projection = undefined;
            if (data.__projection) projection = data.__projection;
            delete data.__projection;

            var query = Model.find(toRules(data), projection)
            if (data.__select) {
                query = query.select(data.__select);
            }
            if (data.__populate) {
                query = populate(query, data.__populate);
            }
            if (data.__sort) {
                query = query.sort(data.__sort);
            }
            query.exec(function(err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(res);

                }
                cb(err, res);
            });
        });
    }

    function fillObject(object, data, propName, newPropName) {
        var assignable = {};
        if (data[propName]) {
            assignable[newPropName || propName] = data[propName];
        }
        return Object.assign(object, assignable);
    }

    function paginate(data, cb) {
        //log('paginate=' + JSON.stringify(data));
        var options = {};
        options = fillObject(options, data, '__select', 'select');
        options = fillObject(options, data, '__sort', 'sort');
        options = fillObject(options, data, '__lean', 'lean');

        if (data.__populate) {
            if (data.__populate.length) {
                options.populate = data.__populate;
            }
            else {
                var __populate = data.__populate;
                delete data.__populate;
                var arr = [];
                for (var x in __populate) {
                    arr.push({
                        path: x,
                        select: __populate[x]
                    });
                }
                options.populate = arr;
            }
        }

        options = fillObject(options, data, '__populate', 'populate');
        options = fillObject(options, data, '__offset', 'offset');
        options = fillObject(options, data, '__page', 'page');
        options = fillObject(options, data, '__limit', 'limit');
        //log('paginate:options:typeof:' + (typeof options));
        //log('paginate:options=' + JSON.stringify(options));
        Model.paginate(toRules(data), options, function(err, result) {
            if (err) return cb(err, result);
            //log('paginate:result=' + JSON.stringify(result));
            return cb(null, result);
            /*
            docs {Array} - Array of documents
            total {Number} - Total number of documents in collection that match a query
            limit {Number} - Limit that was used
            [page] {Number} - Only if specified or default page/offset values were used
            [pages] {Number} - Only if page specified or default page/offset values were used
            [offset] {Number} - Only if specified or default page/offset values were used
            */
        });
    }

    function remove(data, cb) {
        data = {
            _id: data._id
        };
        log('remove=' + JSON.stringify(data));
        check(data, ['_id'], (err, r) => {
            if (err) return cb(err, null);
            Model.remove(toRules(data)).exec((err, r) => {
                cb(err, r);
            });
        });
    }



    function getById(data, cb) {
        //log('getById=' + JSON.stringify(data._id));
        check(data, ['_id'], (err, r) => {
            if (err) return cb(err, r);
            var query = Model.findById(data._id)
            if (data.__select) {
                query = query.select(data.__select);
            }
            if (data.__populate) {
                query = populate(query, data.__populate);
            }
            query.exec((err, r) => {
                if (err) return cb(err, r);
                cb(null, r);
            });
        });
    }

    function get(data, cb) {
        return Promise(function(resolve, reject, emit) {
            log('get=' + JSON.stringify(data));
            //check(data, ['_id'], (err, r) => {
            //  if (err) return cb(err, r);
            var query = Model.findOne(toRules(data))
            if (data.__select) {
                query = query.select(data.__select);
            }
            if (data.__populate) {
                query = populate(query, data.__populate);
            }
            query.exec((err, r) => {
                resolve((err != undefined) ? err : r);
                if (!cb) return;
                if (err) return cb && cb(err, r);
                cb && cb(null, r);

            });
        });
    }

    function check(data, fields, cb) {
        validate(data, fields).error(function(keys) {
            log('check:fail=' + JSON.stringify(data) + ' Keys=' + JSON.stringify(keys));
            cb('Keys required: ' + JSON.stringify(keys), null);
        }).then(() => {
            cb(null, true);
        });
    }

    function removeWhen(data, cb) {
        log('removeWhen=' + JSON.stringify(data));
        Model.remove(toRules(data), (err, r) => {
            if (err) return cb(err, r);
            cb(err, r);
        });
    }

    function removeAll(data, cb, requiredKeys) {
        log('removeAll=' + JSON.stringify(data));
        //check(data, ['ids'], (err, r) => {
        check(data, requiredKeys || ['ids'], (err, r) => {
            if (err) return cb(err, null);
            _removeIds();
        });

        function _removeIds() {
            data = data || {};
            var rules = data.ids ? {
                _id: {
                    $all: data.ids
                }
            } : {};
            Model.remove(rules, (err, r) => {
                if (err) return cb(err, r);
                cb(err, r);
            });
        }
    }

    function toRules(data) {
        data = data || {};
        var rules = {};
        for (var x in data) {
            if (x.indexOf('__') !== -1) {
                if (x == '__$where') {
                    for (var k in data[x]) {
                        rules[k] = {
                            $where: data[x][k]
                        };
                    }
                }
                if (x == '__regexp') {
                    for (var k in data[x]) {
                        rules[k] = new RegExp(data[x][k], 'i');
                        log('toRules:exp' + data[x][k]);
                    }
                }
            }
            else {
                if (x.toString().toLowerCase() == '_id') {

                    var isValid = mongoose.Types.ObjectId.isValid(data[x]);
                    console.log('_ID ', data[x], 'isValid:', isValid);

                    data[x] = mongoose.Types.ObjectId(data[x]);
                }
                rules[x] = {
                    $eq: data[x]
                };
            }
        }
        if (data.__rules) {
            rules = Object.assign(rules, data.__rules);
        }

        rules = removeSpecialFields(rules);

        try {
            log('toRules:' + JSON.stringify(rules));
        }
        catch (e) {
            log('toRules: circular JSON', Object.keys(rules));
        }
        return rules;
    }


    function find(data, cb) {
        log('find=' + JSON.stringify(data));
        Model.find(toRules(data)).exec(cb);
    }


    function _create(data, cb, requiredKeys) {
        //log('create=' + JSON.stringify(data));
        var Model = getModelFromPayload(data);

        data = removeSpecialFields(data);


        log('create');
        check(data, requiredKeys || [], (err, r) => {
            if (err) return cb(err, null);
            return Model.create(data, cb);
        });
    }

    function removeSpecialFields(data) {
        for (var field in data) {
            if (field.toString().indexOf('__') != -1) {
                delete data[field];
            }
        }
        return data;
    }

    function updateOrPushArrayElement(data, cb) {
        var Model = getModelFromPayload(data);

        //Cast ! (Middleware for sub-document creation)
        if (data.__cast && data.__cast.arrayName && data.__cast.model && data.__cast.item) {
            data.__cast.item.__model = data.__cast.model;
            return createUpdate(data.__cast.item, function(err, newItem) {
                if (err) return cb(err);
                removeSpecialFields(data.__cast.item);
                data.__query = {
                    _id: data._id
                };
                data.__query[data.__cast.arrayName + '._id'] = newItem._id;

                data.__update = {};
                data.__update[data.__cast.arrayName + '.$'] = _.clone(data.__cast.item);

                data.__push = {};
                data.__cast.item._id = newItem._id;
                data.__push[data.__cast.arrayName] = data.__cast.item;

                delete data.__cast;

                return updateOrPushArrayElement(data, cb);
            });
        }

        if (!data.__push) return cb("data.__push required");
        /*
                //Try to update
                if (data.__update) {

                    //Required (It can be f)
                    if (!data.__query) return cb("data.__query required");
                    var queryPayload = data.__query; //EX: _id:1,recentviews._id:1


                    return Model.update(data.__query, {
                        $set: data.__update
                    }, (err, rowsAffected) => {
                        if (err) return cb(err);
                        if (rowsAffected == 0 && data.__push) {
                            delete data.__update;
                            return updateOrPushArrayElement(data, cb);
                        }
                        else {
                            console.log('DEBUG DB ARRAY ELEMENT UPDATE', rowsAffected, data);
                            return cb(err, rowsAffected);
                        }
                    });
                }*/

        //Normal push
        return update({
            _id: data._id,
            __rules: {
                $push: data.__push
            }
        }, cb);
    }



    function update(data, cb) {
        var Model = getModelFromPayload(data);
        check(data, ['_id'], (err, r) => {
            if (err) return cb && cb(err, null);
            var _id = data._id;
            delete data._id;
            data = hook('preSave', data);
            Model.update({
                _id: _id
            }, toRules(data), (err, r) => {
                log('update:ok=' + !err + ' ' + JSON.stringify(err));
                if (!cb) return;
                if (err) return cb(err, null);
                log('update:rta=' + JSON.stringify(r));
                return cb(null, r);
            });
        });
    }

    function modelCustom(data, cb) {
        var query = Model;
        for (var command in data) {
            if (!query[command]) {
                return cb(command + ' is not a valid command');
            }
            query = query[command].apply(query, data[command]);
        }
        query.exec(function(err, res) {
            return cb(err, res);
        });
    }

    function aggregate(data, cb) {
        Model.aggregate(data).exec(function(err, res) {
            return cb(err, res);
        });
    }

    return {
        aggregate: aggregate,
        modelCustom: modelCustom,
        schema: schema,
        model: Model,
        _hook: hook,
        paginate: paginate,
        existsById: existsById,
        existsByField: existsByField,
        exists: exists,
        createUpdate: createUpdate,
        save: createUpdate,
        create: _create,
        getAll: getAll,
        update: update,
        remove: remove,
        removeWhen: removeWhen,
        updateOrPushArrayElement: updateOrPushArrayElement,

        get: get,
        getById: getById,
        check: check,
        removeAll: removeAll,
        toRules: toRules,
        find: find,
        create: _create,
        log: log
    };
};

//console.log('backend-mongoose-wrapper end', JSON.stringify(Object.keys(module.exports)));
