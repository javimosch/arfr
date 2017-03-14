var fs = require('fs');
module.exports = {
    ensureDirectory: (path) => {
        if (!fs.existsSync(path))
            fs.mkdirSync(path);
    }
};
