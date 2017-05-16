var loadjs = function(arr) {
    return new Promise(function(resolve, reject) {
        if (arr.length > 0) {
            console.log('log load ', arr[0]);
            gacm.loader.require([arr[0]], function() {
                loadjs(arr.splice(1)).then(resolve);
            });
        }
        else {
            console.log('log load finish');
            resolve();
        }
    });
};

var loadcss = function(arr) {
    return new Promise(function(resolve, reject) {
        if (arr.length > 0) {
            console.log('log load css ', arr[0]);
            gacm.loader.css(arr[0]).then(function() {
                console.log('log load css success',arr[0]);
                loadcss(arr.splice(1)).then(resolve);
            });
        }
        else {
            
            resolve();
        }
    });
};