var SSH = require('simple-ssh');

/*Remote tree (ROOT FOLDER ~/diags)
    -prod (directory of the project, production LIVE nginx folder)
    -repo (directory of the repository of the project)
    
    
    deploy_origin.sh (fetch from gitlab production master, and deploy from local repo)
    deploy_origin_tag.sh (fetch from gitlab production, only if the tag exists, and deploy from local repo)
    deploy_local.sh (deploy from local repo)
*/

const MOVE_TO_ROOT_FOLDER_COMMAND = "cd ~; cd diags;";
const LIST_FILES_IN_ROOT_FOLDER_COMMAND = MOVE_TO_ROOT_FOLDER_COMMAND + ' ls -lrt';
const DEPLOY_TAG_COMMAND = MOVE_TO_ROOT_FOLDER_COMMAND + ' ./deploy_origin_tag.sh';
const DEPLOY_MASTER_COMMAND = MOVE_TO_ROOT_FOLDER_COMMAND + ' ./deploy_origin.sh';

var ssh = new SSH({
    host: '62.210.97.81',
    user: 'root',
    pass: process.env.SSH_PWD
});



module.exports = {
    deployMaster: function() {

    },
    deployTag: deployTag,
    deployMaster:deployMaster,
    logs: pm2Logs,
    test_param:function(arg){
        console.log('ARGUMENT:',arg);
    }
};

function pm2Logs() {
    ssh.exec("pm2 logs", {
        out: function(stdout) {
            console.log(stdout);
        }
    }).start();
}

function deployTag(tagName, callback) {
    console.log('[SSH]', 'deploy-tag', tagName, '[START]');
    ssh.exec(DEPLOY_TAG_COMMAND, {
        args: [tagName],
        out: function(stdout) {
            console.log('[SSH]', 'deploy-tag', tagName, '[STDOUT]', stdout);
        },
        err: function(stderr) {
            console.log('[SSH]', 'deploy-tag', tagName, '[STDERR]', stderr);
        },
        exit: function(code, stdout, stderr) {
            //console.log('[SSH]','deploy-tag',tagName,'[RESPONSE]', stdout);
            console.log('[SSH]', 'deploy-tag', tagName, '[EXIT-CODE]', code);
            callback && callback(stdout);
        }
    }).start();
}

function deployMaster(callback) {
    console.log('[SSH]', 'deploy-master', '[START]');
    ssh.exec(DEPLOY_MASTER_COMMAND, {
        args: [],
        out: function(stdout) {
            console.log('[SSH]', 'deploy-master', '[STDOUT]', stdout);
        },
        err: function(stderr) {
            console.log('[SSH]', 'deploy-master', '[STDERR]', stderr);
        },
        exit: function(code, stdout, stderr) {
            console.log('[SSH]', 'deploy-master', '[EXIT-CODE]', code);
            callback && callback(stdout);
        }
    }).start();
}

function test() {
    ssh.exec(LIST_FILES_IN_ROOT_FOLDER_COMMAND, {
        out: function(stdout) {
            console.log(stdout);
        }
    }).start();
}

//test();
//deployTag('v1.1.5');
//pm2Logs();
