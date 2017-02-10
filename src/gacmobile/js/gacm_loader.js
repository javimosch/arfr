var Loader = function () { }
Loader.prototype = {
    require: function (scripts, callback,id) {
        this.loadCount      = 0;
        this.totalRequired  = scripts.length;
        this.callback       = callback;

        for (var i = 0; i < scripts.length; i++) {
            this.writeScript(scripts[i],scripts.length==1&&id);
        }
    },
    loaded: function (evt) {
        this.loadCount++;

        if (this.loadCount == this.totalRequired && typeof this.callback == 'function') this.callback.call();
    },
    writeScript: function (src,id) {
        var self = this;
        
        if(id){
            var ss = document.querySelector(id);
            if(ss) ss.parentNode.removeChild(ss);
        }
        
        var s = document.createElement('script');
        s.type = "text/javascript";
        
        //s.async = true;
        s.src = src;
        s.addEventListener('load', function (e) { self.loaded(e); }, false);
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(s);
    }
}