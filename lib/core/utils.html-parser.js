((ctx) => {
    ctx.readScriptTags = readScriptTags;
    ctx.readTags = readTags;
    ctx.hasSection = hasSection;
    ctx.replaceSection = replaceSection;
    ctx.getSection = getSection;
    ctx.getSectionParameters= getSectionParameters;

    function hasSection(sectionName, raw) {
        var openTag = '<!--$TAG'.replace('$TAG', sectionName);
        var closeTag = "<!--/$TAG-->".replace('$TAG', sectionName);
        return raw.indexOf(openTag) !== -1 && raw.indexOf(closeTag) !== -1;
    }

    function replaceSection(sectionName, raw, html) {
        var openTag = '<!--$TAG'.replace('$TAG', sectionName);
        var closeTag = "<!--/$TAG-->".replace('$TAG', sectionName);
        
         if (sectionName.indexOf('BUNDLE_JS_5') != -1) {
            //console.log('html: ', html);
        }

        
        return raw.substring(0, raw.indexOf(openTag)) + html +
            raw.substring(raw.indexOf(closeTag) + closeTag.length);
    }

    function getSection(sectionName, html) {
        var openTag = '<!--$TAG'.replace('$TAG', sectionName);
        var closeTag = "<!--/$TAG-->".replace('$TAG', sectionName);
        var index = html.indexOf(openTag);
        if (index === -1) return null;
        index = html.indexOf(closeTag)
        if (index === -1) return null;
        html = html.substring(html.indexOf(openTag)+openTag.length);
        return html.substring(html.indexOf('-->')+3, html.indexOf(closeTag));
        //return html.substring(html.indexOf(openTag)+openTag.length, html.indexOf(closeTag));
    }
    
    function getSectionParameters(sectionName, html) {
        var openTag = '<!--$TAG'.replace('$TAG', sectionName);
        var closeTag = "<!--/$TAG-->".replace('$TAG', sectionName);
        var index = html.indexOf(openTag);
        if (index === -1) return null;
        html = html.substring(index);
        var close = html.indexOf('-->');
        var paramStart = html.indexOf('{');
        if(close != -1 && paramStart != -1){
            if(paramStart < close){
                var paramEnd = html.indexOf('}');
                if(paramEnd !== -1 && paramEnd < close){
                    var params = html.substring(paramStart+1, paramEnd);
                    var rta = {};
                    params.split(',').forEach(function(paramStr){
                       rta[paramStr.split(':')[0]]  = paramStr.split(':')[1];
                    });
                    return rta;
                }
            }
        }
        return null;
    }
    
    function readTags(src,tagName,tagAttributeName) {
        var arr = filterTag(tagName, src);
        
        arr = arr.map(v => (getAttribute(tagAttributeName, v)));
        arr = arr.filter(v => v !== '');
        //console.log('filterTag',tagName,JSON.stringify(arr));
        return arr;
    }

    function readScriptTags(str) {
        var arr = filterTag('script', str);
        arr = arr.map(v => (getAttribute('src', v)));
        arr = arr.filter(v => v !== '');
        //console.log(JSON.stringify(arr));
        return arr;
    }

    function filterTag(tagName, str) {
        //        console.log('html-parser:filterTag:str-type:',(typeof str));
        var rta = [];
        for (var x = 0; x < str.length; x++) {
            if (str.charAt(x) == '<') {
                var n = str.substring(x + 1, x + 1 + tagName.length);
                var content = str.substring(x);
                
                var endIndex = (content.indexOf(tagName + '>')!==-1)?
                    (content.indexOf(tagName + '>')+ tagName.length + 1)
                    :content.indexOf('>') + 1;
                    
                content = content.substring(0, endIndex);
                if (n == tagName) {
                    rta.push(
                        content
                    );
                }
            }
        }
        return rta;
    }

    function getAttribute(n, str) {
        var x = str.substring(str.indexOf(n));
        x = x.substring(x.indexOf('"') + 1);
        x = x.substring(0, x.indexOf('"'));
        //        console.log(typeof x);
        return x;
    }


})(
    (typeof exports !== 'undefined' && exports) ||
    (typeof window !== 'undefined' && window) ||
    this
);
