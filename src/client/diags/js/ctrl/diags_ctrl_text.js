/*global $U*/
/*global $D*/
/*global moment*/
/*global _*/
/*global app*/
/*global Quill*/
/*global tinymce*/
(function() {


    function updateCategorySelectData(s, db,cb) {
        s.categories = [];
        db.ctrl('Category', "get", {
            code: "DIAGS"
        }).then(function(r) {
            if (r && r.ok && r.result) {
                db.ctrl('Category', 'getAll', {
                    _parent: r.result._id
                }).then(function(r) {
                    if (r && r.ok && r.result) {
                        s.categories = r.result;
                        if(cb) cb();
                    }
                });
            }
        });
    }

    app.controller('ctrl-text-edit', ['server', '$scope', '$rootScope', '$routeParams', 'focus',
        function(db, s, r, params) {
            //
            $U.expose('s', s);
            //
            s.item = {
                code: '',
                description: '',
                content: '',
                updatedByHuman: true
            };

            updateCategorySelectData(s, db);
            check(); //checks when the wysing lib is ready and init the components.
            //
            s.read = function() {
                    db.ctrl('Text', 'get', {
                        _id: s.item._id
                    }).then(function(res) {
                        if (res.ok) {
                            s.item = res.result;
                            // s.editor.setHTML(window.decodeURIComponent(s.item.content));
                            tinymce.activeEditor.setContent(window.decodeURIComponent(s.item.content));
                        }
                        else {
                            r.warningMessage('Server issue while reading item. Try later.');
                        }
                    })
                }
                //
            s.save = function() {
                if (!s.item.code) return r.warningMessage('Code required');
                if (!s.item.description) return r.warningMessage('Description required');
                if (!s.item._category) return r.warningMessage('Page Section required');
                //
                s.item.updatedByHuman = true;
                s.item.content = window.encodeURIComponent(tinymce.activeEditor.getContent());
                db.ctrl('Text', 'save', s.item).then(function() {
                    r.route('texts');
                });
            };
            s.delete = function() {
                s.confirm('Delete ' + s.item.code + ' ?', function() {
                    db.ctrl('Text', 'remove', {
                        _d: s.item._id
                    });
                });
            };



            function check() {
                if (typeof window.tinymce !== 'undefined') {
                    r.dom(init);
                }
                else setTimeout(check, 100);
            }

            //

            function initQuill() {
                s.editor = new Quill('#editor', {
                    styles: {
                        '.ql-editor': {
                            'font-family': "'Avenir-Book'"
                        },
                        '.ql-editor a': {
                            'text-decoration': 'none'
                        }
                    },
                    modules: {
                        toolbar: '#toolbar'
                    },
                    theme: 'snow'
                });

                s.editor.on('text-change', function(delta, source) {
                    var html = s.editor.getHTML();
                    s.item.content = window.encodeURIComponent(html);
                });
            }

            function initTinyMCE() {

                if (typeof(window.tinyMCE) !== 'undefined') {
                    var length = window.tinyMCE.editors.length;
                    for (var i = length; i > 0; i--) {
                        window.tinyMCE.editors[i - 1].remove();
                    };
                }

                tinymce.init({
                    selector: '#editor',
                    theme: 'modern',
                    //width: 600,
                    height: 300,
                    plugins: [
                        //'autoresize',
                        'advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker',
                        'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
                        'save table contextmenu directionality emoticons template paste textcolor'
                    ],
                    content_css: 'css/diags.design.css',
                    toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons'
                });

            }

            function init() {
                //initQuill();
                initTinyMCE();


                if (params && params.id && params.id.toString() !== '-1') {
                    s.item._id = params.id;
                    r.dom(s.read, 0);
                }
                else {

                }
            }
        }
    ]);



    app.directive('textsList', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, server, $mongoosePaginate) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {},
            templateUrl: 'views/directives/directive.fast-crud.html',
            link: function(s, elem, attrs) {
                //$D.createSiteSectionsCategories(server);
            },
            controller: function($scope, $element, $attrs, $transclude) {
                var r = $rootScope,
                    db = server,
                    s = $scope,
                    dbPaginate = $mongoosePaginate.get('Text');
                $U.expose('s', s);
                r.routeParams({
                    prevRoute: 'texts'
                });



                function update(items, cb) {
                    var data = {
                        //__select: "_client _diag address start end price status created createdAt",
                        __populate: {
                            '_category': 'code',
                        },
                        __rules:{
                            _category:{
                                $in: s.model.categories.map(c=>c._id)
                            }
                        },
                        __sort: "-createdAt",

                    };

                    r.dom(_apply);

                    function _apply() {

                        /*
                        var code = s.model.filter.fields.code;
                        if (code) {
                            data.__rules = data.__rules || {};
                            data.__rules.code = {
                                $in: code
                            };
                        }*/

                        data = Object.assign(data, s.model.filter.payload);
                        //console.info('filter-payload', s.model.filter.payload);

                        dbPaginate.ctrl(data, s.model).then(res => {
                            if (cb) {
                                cb(res.result);
                            }
                            else {
                                s.model.update(res.result, null);
                            }
                        });
                    }
                }
                s.model = {
                    init: function() {
                        updateCategorySelectData(s.model, db,()=>{
                            s.model.filter.firstTime();    
                        });
                        
                    },
                    filter: {
                        store: "TEXTS_LIST",
                        template: 'textsFilter',
                        update: update,
                        rules: {
                            code: 'contains',
                            _category: "match"
                        }
                    },
                    pagination: {
                        itemsPerPage: 5
                    },
                    paginate: (cb) => {
                        update(null, cb)
                    },
                    click: (item, index) => {
                        r.routeParams({
                            item: item,
                        });
                        r.route('texts/edit/' + item._id);
                    },
                    buttons: [{
                        label: "Refresh",
                        type: () => "btn diags-btn bg-azure-radiance margin-left-0 margin-right-1",
                        click: () => s.model.filter.filter()
                    }, {
                        label: "Clear Filters",
                        type: () => "btn diags-btn bg-azure-radiance margin-left-0 margin-right-1",
                        click: () => s.model.filter.clear && s.model.filter.clear()
                    }, {
                        label: "New Item",
                        type: () => "btn diags-btn bg-azure-radiance margin-right-1",
                        click: () => r.route('texts/edit/-1')
                    }],
                    columns: [{
                        label: "Page Section",
                        name: '_category',
                        format: function(v, item) {
                            return item._category && item._category.code || "";
                        }
                    }, {
                        label: "Code",
                        name: 'code' //,
                            //format: (v, item) => item._diag.email
                    }, {
                        label: "Description",
                        name: 'description' //,
                            //format: (v, item) => item._client.email
                    }, {
                        label: 'UpdatedAt',
                        name: 'updatedAt',
                        format: (v, item) => {
                            return r.momentFormat(item.updatedAt, 'DD-MM-YY HH:mm');
                        }
                    }, {
                        label: 'Edit',
                        disabled: true,
                        name: 'updatedAt',
                        format: (v, item) => {
                            return '<i class="fa fa-pencil-square-o link" ng-click="model.editItem(item)" aria-hidden="true"></i>';
                        }
                    }],
                    editItem: (item) => {
                        var win = window.open(window.location.origin + "/admin#/texts/edit/" + item._id, '_blank');
                        //win.focus();
                    },

                    items: [],
                    records: {
                        label: 'Records',
                        show: true
                    }
                };

            }
        };
    });
})();