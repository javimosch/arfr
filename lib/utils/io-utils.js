var fs = require('fs');
var mmm = require('mmmagic'),
    Magic = mmm.Magic;
module.exports = {
    ensureDirectory: (path) => {
        if (!fs.existsSync(path))
            fs.mkdirSync(path);
    },
    detectMimeType: (filePath) => {
        var magic = new Magic(mmm.MAGIC_MIME_TYPE);
        return new Promise((resolve, reject) => {
            magic.detectFile(filePath, function(err, result) {
                if (err) return reject(err);
                return resolve(result);
            });
        });
    }
};
