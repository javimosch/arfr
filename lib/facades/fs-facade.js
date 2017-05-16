var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var sander = require('sander');
var readDirFiles = require('read-dir-files');
module.exports = {
    exists: function() {
        var args = Array.prototype.slice.call(arguments)
        return sander.exists.apply(sander, args);
    },
    readdir: function() {
        var args = Array.prototype.slice.call(arguments)
        return sander.readdir.apply(sander, args);
    },
    readDirFiles: {
        list: (path) => resolver.promise((resolve, reject) => {
            readDirFiles.list(path, (err, arr) => err ? reject(err) : resolve(arr));
        })
    }
}
