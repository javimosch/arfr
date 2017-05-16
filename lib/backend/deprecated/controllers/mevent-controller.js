var co = require('co');
const controllers = require('../model/backend-controllers-manager');

module.exports = {
    save: (data, cb) => {

        //If there is not any status, lets go open
        if (!data.status) {
            data.status = 'open';
        }

        //If owner is not in the _users array, let put it in
        if (data._owner) {
            data._users = data._users || [];
            if (data._users.filter(u => (u && u._id || u) == (data._owner && data._owner._id || data._owner)).length == 0) {
                data._users.push(data._owner);
            }
        }

        return controllers.mevent.core.save(data, cb);
    }
}
