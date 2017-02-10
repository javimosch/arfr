/* global $g */
/*global localStorage*/
$g.save = (() => {
    return {
        setData: (id, raw) => {
            return new Promise((resolve, error) => {
                id = 'store#' + id;
                try {
                    raw = JSON.stringify(raw);
                    localStorage.setItem(id, raw);
                    resolve();
                }
                catch (e) {
                    console.warn('store setData fails');
                    error();
                }
            });
        },
        getData: (id) => {
            return new Promise((resolve, error) => {
                id = 'store#' + id;
                try {
                    var localData = JSON.parse(localStorage.getItem(id));
                    resolve(localData);
                }
                catch (e) {
                    console.warn('store getData fails');
                    error();
                }
            })
        }
    }
})();