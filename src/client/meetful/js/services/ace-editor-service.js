/*global angular*/
angular.module('ace-editor-service', []).service('aceEditor', function($rootScope, appGui, $log, $timeout) {
    var self = {};
    self.bind = (s, handler) => {
        s.getACEContent = getACEContent;

        function getACEContent(encode) {
            encode = encode == undefined ? true : encode;
            var rta = '';
            if (s.editor && s.editor.getValue) {
                rta = s.editor.getValue() || '';
            }
            if (encode) rta = window.encodeURIComponent(rta);
            return rta;
        }
        s.setACEContent = setACEContent;

        function setACEContent(html) {
            if (s.editor && s.editor.getValue) {
                return s.editor.setValue(html || '');
            }
            else {
                appGui.errorMessage('A value is trying to be set and ACE Editor is not yet initialized.');
            }
        }

        function initAce() {
            s.editor = window.ace.edit("editor");
            s.editor.getSession().setMode("ace/mode/html");
            s.editor.setTheme("ace/theme/merbivore");
            s.editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true
            });
            s.editor.getSession().setUseWrapMode(true);

            var previewRendered = false;
            var _keyPressedAt = Date.now();
            s.editor.on("input", function() {
                previewRendered = false;
                _keyPressedAt = Date.now();
            });
            setInterval(function() {
                if (previewRendered) return;
                if ((Date.now() - _keyPressedAt < 1000 * 2)) {
                    return $log.log('DEBUG waiting 2 seconds delay...');
                }
                if ($('#ace-render').length > 0) {
                    previewRendered = true;
                    $timeout(function() {
                        try {
                            var iframe = document.createElement('iframe');
                            var html = getACEContent(false);
                            $('#ace-render').empty().append(iframe);
                            iframe.contentWindow.document.open();
                            iframe.contentWindow.document.write(html);
                            iframe.contentWindow.document.close();
                        }
                        catch (err) {
                            $log.log('DEBUG WARN ace-render', err);
                        }
                        s.$apply();
                    });
                }
            }, 2000);

            s.toggleFullscreen = function() {
                s.editor.container.webkitRequestFullscreen();
            };
            s.formatACECode = () => {
                s.editor.session.setValue(html_beautify(s.editor.session.getValue()));
            };
            s.editor.commands.addCommand({
                name: "fullscreen",
                bindKey: "ctrl-shift-f",
                exec: function(env, args, request) {
                    s.toggleFullscreen();
                }
            });
            $log.debug('Fullscreen Ctrl-shift-f');
            s.editor.commands.addCommand({
                name: "save",
                bindKey: "ctrl-shift-s",
                exec: function(env, args, request) {
                    s.save()
                }
            });

            s.editor.commands.addCommand({
                name: "showKeyboardShortcuts",
                bindKey: {
                    win: "Ctrl-Alt-h",
                    mac: "Command-Alt-h"
                },
                exec: function(editor) {
                    window.ace.config.loadModule("ace/ext/keybinding_menu", function(module) {
                        module.init(editor);
                        editor.showKeyboardShortcuts()
                    })
                }
            })
            $log.debug('Keyboard hints Ctrl-Alt-h');
            waitBeautify(function() {
                s.editor.commands.addCommand({
                    name: "beautify",
                    bindKey: "ctrl-alt-f",
                    exec: function(env, args, request) {
                        s.formatACECode();
                    }
                });
                $log.debug('Beautify added (CTRL + ALT + K)');
            });



        };


        function waitBeautify(cb) {
            if (!window.ace) return setTimeout(() => waitBeautify(cb), 500);
            if (window.html_beautify) {
                cb && cb();
            }
            else {
                return setTimeout(() => waitBeautify(cb), 500);
            }
        }

        function checkAndInitializeAceEditor(cb) {
            if (typeof window.ace !== 'undefined') {
                appGui.dom(() => {
                    initAce();
                    cb && cb();
                });
            }
            else setTimeout(() => {
                checkAndInitializeAceEditor(cb);
            }, 100);
        }
        checkAndInitializeAceEditor(handler);
    };
    return self;
});
