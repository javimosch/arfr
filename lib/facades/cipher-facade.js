var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var CryptoJS = require("crypto-js");
var logger = resolver.logger().get("FACADE", "CIPHER");
const SECRET_HASH = resolver.env().SECRET_HASH || 'secret';
if (SECRET_HASH === 'secret' && resolver.env().PROD) {
    logger.warn('SECRET_HASH is not set. Security vulnerability !');
}
module.exports = {
    encodePassword: encodePassword,
    decodePassword: decodePassword,
    encodeObject: (data) => {
        return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_HASH).toString();
    },
    decodeObject: (dataAsString) => {
        var bytes = CryptoJS.AES.decrypt(dataAsString, SECRET_HASH);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
}

function encodePassword(pwd) {
    return CryptoJS.AES.encrypt(pwd, SECRET_HASH).toString();
}

function decodePassword(hash) {
    var bytes = CryptoJS.AES.decrypt(hash, SECRET_HASH);
    return bytes.toString(CryptoJS.enc.Utf8);
}
