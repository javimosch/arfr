var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var sander = require('sander');
var readDirFiles = require('read-dir-files');
const pathExists = require('path-exists');
 

module.exports = {
    writeFile: function() {
        var args = Array.prototype.slice.call(arguments);
        return sander.writeFile.apply(sander, args);
    },
    readFile: function() {
        var args = Array.prototype.slice.call(arguments);
        return sander.readFile.apply(sander, args);
    },
    existsSync: function() {
        var args = Array.prototype.slice.call(arguments);
        return sander.existsSync.apply(sander, args);
    },
    exists: function(path) {
        //var args = Array.prototype.slice.call(arguments)
        return pathExists(path);
        //return sander.exists.apply(sander, args);
    },
    readdir: function() {
        var args = Array.prototype.slice.call(arguments);
        return sander.readdir.apply(sander, args);
    },
    readDirFiles: {
        list: (path) => resolver.promise((resolve, reject) => {
            readDirFiles.list(path, (err, arr) => err ? reject(err) : resolve(arr));
        })
    }
}
