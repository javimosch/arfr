var cloudinary = require('../model/providers').cloudinary;
var controllers = require('../model/backend-controllers-manager');
const del = require('del');



var Logger = controllers.logs.createLogger({
    name: "API",
    category: "IMAGE"
});


module.exports = {
    test: test,
    test_save: test_save,
    saveCloudinary: saveCloudinary
};


function test(data, cb) {
    Logger.debugTerminal('TEST SUCCESS !');
    return cb(null, "Test success");
};

function saveCloudinary(data, cb, req, res) {
    if (!req.files || !req.files.file || !req.files.file[0]) {
        Logger.debugTerminal(req.files);
        return cb('Endpoint /multer_single expected and input with name file expected.');
    }

    if (!data.__cloudinary) {
        return cb('data.__cloudinary required', data);
    }
    if (typeof data.__cloudinary !== 'object') {
        return cb({
            msg:'data.__cloudinary expected to be an object',
            __cloudinary:data.__cloudinary
        });
    }
    var file = req.files.file[0];
    //Logger.debugTerminal('calling cloudinary...');
    cloudinary.uploader.upload(file.path, function(result) {
        //Logger.debugTerminal('cloudinary says',result);
        if (result.error) {
            Logger.errorSave('Cloudinary', result);
            return cb(result);
        }
        cb(null, {
            path: file.path,
            cloudinary: result
        });
        del([file.path]);
    }, data.__cloudinary || undefined);
}

function test_save(data, cb, req, res) {
    var file = req.files.file[0];
    /*
    FILE: 
    
    { single: 
    [1]    [ { fieldname: 'single',
    [1]        originalname: 'diagnostical-petit-177.png',
    [1]        encoding: '7bit',
    [1]        mimetype: 'image/png',
    [1]        destination: '../temp/',
    [1]        filename: '26dda2f2536b70025a85929bffffe016',
    [1]        path: '../temp/26dda2f2536b70025a85929bffffe016',
    [1]        size: 3823 }*/


    /*CLOUDINARY PATH NOT FOUND
    "error": {
        "errno": -2,
        "code": "ENOENT",
        "syscall": "open",
        "path": "/home/ubuntu/workspace/app/backend/temp/bb4476ab08a5aa57f82e5a7957215a4fasd"
      }*/

    /*CLOUDINARY SUCCESS
      {
    "path": "/home/ubuntu/workspace/app/backend/temp/796bf3b004aba56a24f6e10c490bb900",
    "cloudinary": {
      "public_id": "test_save/IMG_0598.JPG",
      "version": 1485870330,
      "signature": "0351ba35568a0f5e3edb9d579ca53e860f2415d1",
      "width": 1440,
      "height": 1080,
      "format": "jpg",
      "resource_type": "image",
      "created_at": "2017-01-31T13:45:30Z",
      "tags": [
        "test"
      ],
      "bytes": 394915,
      "type": "upload",
      "etag": "cd95571c30ae0dbc5ed9c1e8d5956020",
      "url": "http://res.cloudinary.com/paris7510/image/upload/v1485870330/test_save/IMG_0598.JPG.jpg",
      "secure_url": "https://res.cloudinary.com/paris7510/image/upload/v1485870330/test_save/IMG_0598.JPG.jpg",
      "original_filename": "796bf3b004aba56a24f6e10c490bb900"
    }
  }
  */
    cloudinary.uploader.upload(file.path, function(result) {
        if (result.error) {
            Logger.errorSave('Cloudinary', result);
            return cb(result);
        }
        cb(null, {
            path: file.path,
            cloudinary: result
        });
        del([file.path]);
    }, {
        public_id: 'test_save/image',
        tags: 'test'
    });
}
