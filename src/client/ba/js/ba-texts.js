//MISITIOBA_TEXTS 57615fb4e1ad73030033ccc5

/*global $U*/
(function() {
    var URL = null;
    var categoryRootCode = 'BA_ROOT';
    var categoryCode = 'BA_TEXTS';
    var Text = window.ba.db('Text');
    var Category = window.ba.db('Category');

    function validURL(cb) {
        if (!URL) {
            $U.ajax('/serverURL', function(data) {
                URL = data.URL;
                cb();
            });
            return false;
        }
        else {
            return true;
        }
    }

    function devEnviroment() {
        return window.location.origin.indexOf('maerp-javoche') != -1;
    }

    function report(arr) {
        var Text = window.ba.db('Text');
        for (var x = 0; x < arr.length; x++) {
            (function(_x) {
                setTimeout(() => {
                        Text('reportNotFound', {
                            code: arr[_x],
                            categoryCode: categoryCode,
                            categoryRootCode: categoryRootCode
                        })
                    },
                    x + 1 * 1000);

            })(x);
        }
    }

    function get(code, cb) {
        return Text('get', {
            code: code
        });
    }

    function getCategoryID(code) {
        return Category('get', {
            code: code
        });
    }

    function getAll() {
        return new $U.MyPromise((resolve, error, emit) => {
            getCategoryID(categoryCode).then(_cat => {
                Text('getAll', {
                    _category: _cat._id
                }).then(data => {
                    console.info('texts', data);
                    resolve(data);
                });
            });
        });
    }

    if (devEnviroment) {
        report(['BA_TEXT_PRJ_COJONES']);
    }



    getAll().then((data) => {
        if (data) {
            var o = {};
            data.forEach(t => {
                o[t.code] = t.content;
            });
            texts.data = o;
            console.info(o);
        }
    })

    window.ba = window.ba || {};
    var texts = {};
    texts.get = get;
    window.ba.texts = texts;
})();