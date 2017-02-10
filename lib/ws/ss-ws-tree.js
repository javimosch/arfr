var dirTree = require('directory-tree');
var path = require("path");
var heConfig = require(path.join(process.cwd(),'/lib/config'));

module.exports = {
    tree:(path)=>{
        return dirTree(path);
    },
    ssFolder:(appName,type)=>{
        var path = process.cwd()+'/src/'+type+'/'+appName;
        console.log('ss debug ss-ws-tree config keys',Object.keys(heConfig()));
        console.log('ss debug ss-ws-tree ssFolder : path',path);
        return dirTree(path);
    }
};