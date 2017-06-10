var path = require("path");
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var logger = resolver.logger().get('GENERATOR', 'BAGS');
module.exports = {
    configure: configure
};


function configure(app) {
    return resolver.coWrapExec(function*() {

        var basePath = path.join(process.cwd(), 'src/client', resolver.env().APP_NAME, 'beta');
        var files = yield resolver.generatorUtils().getFilesTreeRecursiveAsync(basePath);

        var getFileContent = (filePath) => files[filePath];
        var createScriptCodeHtml = (name) => "<!--" + createScriptCode(name) + "-->";
        var createScriptCode = (name) => "__" + name.toUpperCase() + "_BLOCK__";

        var filePaths = Object.keys(files);

        var bagPaths = filePaths.filter(f => f.indexOf('-bag') !== -1);
        var bagScriptsPaths = bagPaths.filter(f => f.indexOf('-bag') !== -1 && f.indexOf('.js') !== -1);
        var bagHtmlPaths = bagPaths.filter(f => f.indexOf('.html') !== -1);

        var viewPaths = filePaths.filter(f => f.indexOf('-bag') === -1 && f.indexOf('-partial') === -1);
        var viewHtmlPaths = viewPaths.filter(f => f.indexOf('-bag') === -1 && f.indexOf('-partial') === -1 && f.indexOf('.html') !== -1);

        var partialPaths = filePaths.filter(f => f.indexOf('-partial') !== -1);
        var partialHtmlPaths = partialPaths.filter(f => f.indexOf('.html') !== -1);


        //Register normal partials
        var name;
        for (var x in partialHtmlPaths) {
            name = partialHtmlPaths[x].substring(partialHtmlPaths[x].lastIndexOf('/') + 1, partialHtmlPaths[x].lastIndexOf('.'));
            yield resolver.getFacade('hbs').registerPartialFromFile(name, path.join(basePath, partialHtmlPaths[x]));
        }

        //Register bag partials and store bagScripts
        var bagScripts = {};
        var scriptIndex, scriptContents, partialContents;
        for (x in bagHtmlPaths) {
            name = bagHtmlPaths[x].substring(bagHtmlPaths[x].lastIndexOf('/') + 1, bagHtmlPaths[x].lastIndexOf('.'));
            partialContents = getFileContent(bagHtmlPaths[x]);
            partialContents += createScriptCodeHtml(name);
            yield resolver.getFacade('hbs').registerPartial(name, partialContents);

            scriptIndex = bagPaths.indexOf(bagHtmlPaths[x].replace('.html', '.js'));
            if (scriptIndex !== -1) {
                scriptContents = getFileContent(bagPaths[scriptIndex]);
                bagScripts[name] = scriptContents;
            }
        }

        //Store bagScripts (abstract)
        for (var x in bagScriptsPaths) {
            name = bagScriptsPaths[x].substring(bagScriptsPaths[x].lastIndexOf('/') + 1, bagScriptsPaths[x].lastIndexOf('.'));
            if (bagPaths.indexOf(bagScriptsPaths[x].replace('.js', '.html')) === -1) {
                bagScripts[name + '_ABSTRACT'] = getFileContent(bagScriptsPaths[x]);
                yield resolver.getFacade('hbs').registerPartial(name, createScriptCodeHtml(name + '_ABSTRACT'));
            }
        }


        //Compile views
        var html, i, viewHtmlBasePath, root, fileName = 'index.html',attachedScriptBags = [], scriptCode;
        for (x in viewHtmlPaths) {
            attachedScriptBags = [];
            viewHtmlBasePath = viewHtmlPaths[x].substring(0, viewHtmlPaths[x].lastIndexOf('/')).split(".").join("/");
            //ext = viewHtmlPaths[x].substring(viewHtmlPaths[x].lastIndexOf('.'));
            name = viewHtmlPaths[x].substring(viewHtmlPaths[x].lastIndexOf('/') + 1, viewHtmlPaths[x].lastIndexOf('.'));
            html = getFileContent(viewHtmlPaths[x]);
            html = resolver.getFacade('hbs').compile(html);


            html += '<script>';

            //Abstract scripts
            var scriptNamesArray = Object.keys(bagScripts).filter(n => n.toUpperCase().indexOf('ABSTRACT') !== -1).map(n => n);
            attachedScriptBags = attachedScriptBags.concat(scriptNamesArray);
            for (i in scriptNamesArray) {
                scriptCode = createScriptCode(scriptNamesArray[i]);
                if (html.indexOf(scriptCode) !== -1) {
                    html = html.replace('<!--' + scriptCode + '-->', '');
                    html += bagScripts[scriptNamesArray[i]];
                    //logger.debugTerminal('Looking for ', createScriptCode(scriptNamesArray[i]));
                }
            }
            //Bag scripts
            scriptNamesArray = Object.keys(bagScripts).filter(n => n.toUpperCase().indexOf('ABSTRACT') === -1).map(n => n);
            attachedScriptBags = attachedScriptBags.concat(scriptNamesArray);
            for (i in scriptNamesArray) {
                scriptCode = createScriptCode(scriptNamesArray[i]);
                if (html.indexOf(scriptCode) !== -1) {
                    html = html.replace('<!--' + scriptCode + '-->', '');
                    html += bagScripts[scriptNamesArray[i]];
                    //logger.debugTerminal('Looking for ', createScriptCode(scriptNamesArray[i]));
                }
            }

            html += '</script>';

            root = path.join(process.cwd(), resolver.env().DEST);
            basePath = path.join(root, viewHtmlBasePath);
            yield resolver.getFacade('fs').writeFile(basePath, fileName, html);
            app.get('/' + viewHtmlBasePath, function(req, res, next) {
                res.sendFile(path.join('/', viewHtmlBasePath, fileName), {
                    root: root
                });
            });

            logger.debugTerminal('ROUTE', '/' + viewHtmlBasePath, html.length + ' chars');
        }

        
        return Promise.resolve(true);
    });
}
