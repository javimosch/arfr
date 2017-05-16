//MISITIOBA_TEXTS 57615fb4e1ad73030033ccc5

/*global $U*/
(function() {
    var URL = null;

    function validURL(cb) {
        if (!URL) {
            return URL = window.location.origin;
            $U.ajax(window.ROOT+'files/config', function(data) {
                
                if(data.readyState == 4){
                    return URL = window.location.origin;
                }
                
                console.log('files/config',data);
                
                data = JSON.parse(window.atob(data));
                data.config = JSON.parse(window.atob(data.config));
                console.info('URL',data.config.serverURL);
                URL = data.config.serverURL;
                cb();
            });
            return false;
        }
        else {
            return true;
        }
    }

    function ctrl(ctrlName, ctrlAction, payload) {
        return new $U.MyPromise((resolve, error, emit) => {
            function call() {
                $U.ajax(URL + '/ctrl/' + ctrlName + '/' + ctrlAction, (res) => {
                    if (res.ok) {
                        emit('success', null, res);
                    }
                    else {
                        emit('fail', null, res);
                        emit('error', null, res);
                    }
                    emit('complete', null, res);
                    resolve(res.result, res);
                }, payload);
            }
            if (!validURL(() => ctrl(ctrlName, ctrlAction, payload))) return;
            call();
        });
    }

    function collection(collectionName) {
        return (ctrlAction, payload) => ctrl(collectionName, ctrlAction, payload);
    }

    function working() {

    }

    window.ba = window.ba || {};
    var db = collection;
    db.ctrl = ctrl;
    window.ba.db = db;
})();