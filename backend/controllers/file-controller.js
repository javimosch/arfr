var req = (n) => require('../model/' + n);
var atob = require('atob'); //decode
var btoa = require('btoa'); //encode
var controllers = null;
var Grid = require('gridfs-stream');
var fs = require('fs');
var path = require("path");
var generatePassword = require("password-maker");
//var inspect = require('util').inspect;
var utils = require('../model/utils');
var modelName = 'file';
var conn, gfs, mongoose;

var Logger = null;

var actions = {
    log: (msg) => {
        if (!Logger) {
            Logger = controllers.logs.createLogger({
                name: "API",
                category: "FILES"
            });
        }
        Logger.log(msg);
    }
};

var configure = (m) => {
    mongoose = m;
    Grid.mongo = mongoose.mongo;
    conn = mongoose.connection;
    // Schema = mongoose.Schema;
    gfs = Grid(conn.db);
};
var configureActions = () => {
    actions = req('backend-mongoose-wrapper').create('File', mongoose);
    controllers = req('backend-controllers-manager');
};

module.exports = {
    configureActions: configureActions,
    configure: configure,
    exists: exists,
    read: read,
    find: find,
    remove: remove,
    get: get,
    save: save,
    removeAll: removeAll,
    //getAll: getAll,
    stream
};

function dbToHD(data, cb) {
    actions.log('dbToHD:start=' + JSON.stringify(data));
    var fs_write_stream = fs.createWriteStream(data.path);
    var readstream = gfs.createReadStream({
        _id: data._id
    });

    readstream.on('close', function(file) {
        //var msg = file.filename + ' written to ' + data.path;
        actions.log('dbToHD:success');
        find({
            _id: data._id
        }, (err, _file) => {
            if (err) return cb(err);
            if (_file) {
                cb(null, {
                    ok: true,
                    _file: _file
                });
            }
            else {
                return cb(null, {
                    ok: false,
                    _file: null
                });
            }
        });

    });

    readstream.pipe(fs_write_stream);

};

function stream(data, cb, req, res) {
    console.log('FILE:stream:start');
    data = atob(data);
    data = JSON.parse(data);
    //
    data.path = utils.getFileTempPath('tempfile_' + Date.now() + '.pdf');
    dbToHD(data, (err, rr) => {
        if (err) return cb(err);
        if (!rr.ok) return cb('The file is corrupted and cannot be streamed');
        data.name = data.name || rr._file.filename;
        //
        res.setHeader("content-type", "application/pdf");
        res.setHeader('Content-disposition', ' filename=' + (data.name || 'file') + '.pdf'); //attachment;
        //
        var path = data.path;
        console.log('FILE:stream:path:' + path);
        var stream = fs.createReadStream(path, {
            bufferSize: 64 * 1024
        })
        var had_error = false;
        stream.on('error', function(_err) {
            console.log('FILE:stream:error:' + JSON.stringify(_err));
            had_error = true;
        });
        stream.on('close', function() {
            console.log('FILE:stream:close');
            if (!had_error) {
                setTimeout(function() {
                    try {
                        if (fs.existsSync(path)) {
                            fs.unlink(path);
                        }
                    }
                    catch (e) {};
                }, 60000);
                console.log('FILE:stream:delete-file', path);
            }
        });
        stream.pipe(res);
        console.log('FILE:stream:streaming', path);
    });
}

function getAll(data, cb) {
    controllers.files.find({}, (err, files) => {
        if (err) return cb(err);
        ctrl('User').getAll({
            userType: 'diag',
            __rules: {
                pdfId: {
                    $ne: null
                }
            }
        }, (err, _diags) => {
            if (err) return cb(err);
            ctrl('Order').getAll({
                __rules: {
                    status: {
                        $in: ['delivered', 'completed']
                    }
                }
            }, (err, _orders) => {
                if (err) return cb(err);

                files = files.map(_file => {
                    //
                    _file._diag = null;
                    _file._order = null;
                    //
                    _diags.forEach(_diag => {
                        if (_diag.diplomes) {
                            _diag.diplomes.forEach(_diplomeId => {
                                if (_diplomeId == _file._id) {
                                    _file._diag = _diag;
                                }
                            });
                        }
                    });
                    _orders.forEach(_order => {
                        if (_file._order) return;
                        if (_order.pdfId == _file._id) {
                            _file._order = _order;
                        }
                    })
                    return _file;
                });
                //
                cb(null, files);
            });
        });
    });
}



function read(data, cb) {
    actions.log('read:start=' + JSON.stringify(data));
    var fs_write_stream = fs.createWriteStream('file_' + data.name + '_' + generatePassword(8) + '_.txt');
    var readstream = gfs.createReadStream({
        filename: data.name
    });
    readstream.pipe(fs_write_stream);
    fs_write_stream.on('close', function() {
        var msg = 'read:rta=file ' + data.name + ' has been written fully!';
        actions.log(msg);
        cb(null, msg);
    });
}

function get(data, cb) {
    actions.log('get:start=' + JSON.stringify(data));
    if (!data._id) return cb({
        message: '_id required!'
    });


    find(data, (err, file) => {
        if (err) {
            ctrl('Log').save({
                message: 'File get error',
                type: 'error',
                data: {
                    name: 'ctrl.file.get',
                    err: err,
                    payload: data
                }
            }, () => cb({
                error: "File not found",
                details: err
            }));
        }
        else {
            if (!file) {
                return cb({
                    error: "File not found"
                });
            }

            var readstream = gfs.createReadStream({
                _id: mongoose.Types.ObjectId(data._id)
            });
            readstream.on('error', function(err) {
                console.log('An error occurred!', err);
                throw err;
            });
            actions.log('get:end=' + JSON.stringify(file));
            file.stream = readstream;
            cb(null, file);
        }
    });
}

function _streamToDb(data, cb) {
    actions.log('save:_streamToDb=' + JSON.stringify(Object.keys(data)));
    data.file.pipe(gfs.createWriteStream({
        filename: data.name,
        mode: 'w',
        chunkSize: 1024,
        content_type: data.mimetype
    })).on('close', function(file) {
        var msg = file.filename + ' written To DB';
        actions.log(msg);
        cb(null, {
            result: file,
            message: msg
        });
    })
}

//save a file (type=file need to be the last item of the form.)
function save(data, cb, req, res) {
    actions.log('save:start=' + JSON.stringify(data));
    if (req.busboy) {
        var requiredFileds = ['name', 'mimetype', 'file'];



        var interval = setInterval(() => {
            var success = true;
            requiredFileds.forEach((k) => {
                if (!data[k]) {
                    actions.log('save:waiting for property ' + k + ' in data.');
                    success = false;
                }
            });
            if (success) {
                clearInterval(interval);
                _streamToDb(data, cb);
            }
        }, 1000);
        req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
            //console.log('save:field=', key, value, keyTruncated, valueTruncated);
            data[key] = value;
        });
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            //console.log('save:file=', fieldname, inspect(file), filename, encoding, mimetype);
            data.file = file;
            data.mimetype = mimetype;
        });

        req.pipe(req.busboy);

        //console.info('query',req.query);
        //console.info('params',req.params);
        //console.info('body',req.body);
    }
    else {
        actions.log('save:error= busboy required.');
        return cb('busboy requried', null);
    }
}

function exists(data, cb) {
    actions.log('exists:start=' + JSON.stringify(data));
    var options = {
        filename: data.name
    }; //can be done via _id as well
    gfs.exist(options, function(err, found) {
        if (err) return cb(err, null);
        actions.log('exists:rta=' + found);
        cb(null, (found ? true : false));
    });
}

function find(data, cb) {
    actions.log('find:start=' + JSON.stringify(data));
    var opt = {};
    if (data.name) {
        opt = {
            filename: data.name
        };
    }
    else {
        opt = data;
    }

    if (opt._id) {
        gfs.findOne({
            _id: opt._id
        }, function(err, file) {
            if (err) return cb(err, null);
            actions.log('find:rta=' + JSON.stringify(file));
            cb(null, file);
        });
    }
    else {
        gfs.files.find(opt).toArray(function(err, files) {
            if (err) return cb(err, null);
            var ff = files.map((f) => ({
                _id: f._id,
                filename: f.filename
            }));
            actions.log('find:rta=' + JSON.stringify(ff));
            cb(null, files);
        });
    }


}

function remove(data, cb) {
    actions.log('remove:start=' + JSON.stringify(data));
    var opt = {};
    if (data._id) opt._id = data._id;
    else if (data.name) opt.filename = data.name;
    else return cb({
        message: '_id or name required!'
    });
    gfs.remove(opt, (err) => {
        if (err) return cb(err, null);
        actions.log('remove:rta=' + JSON.stringify(true));
        cb(null, true);
    });
}

function removeAll(data, cb) {
    actions.log('removeAll:start=' + JSON.stringify({}));
    find({}, (err, files) => {
        if (err) return cb(err, files);
        files.forEach(file => {
            remove({
                _id: file._id
            }, () => {});
        });
    });
    cb(null, true);
}

function streamToString(stream, cb) {
    const chunks = [];
    stream.on('data', (chunk) => {
        chunks.push(chunk);
    });
    stream.on('end', () => {
        cb(chunks.join(''));
    });
}
