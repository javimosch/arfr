(function() {
    var wrapper = null;
    var consoleHolder = console;
   
   /*
   
    console = {};
    console.log = function(args) {
        if (document && document.body) {
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'log-wrapper';
                document.body.appendChild(wrapper);
            }
            wrapper.innerHTML = wrapper.innerHTML + '<br>' + JSON.stringify(args);
        }
        consoleHolder.log(args);
    };
    */

})();