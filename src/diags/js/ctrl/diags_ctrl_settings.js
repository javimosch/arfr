/*global angular*/
/*global $U*/
/*global $D*/
/*global moment*/
/*global _*/
/*global tinymce*/
(function() {
    var app = angular.module('diags_ctrl_settings', []);
    app.controller('diags_ctrl_settings', ['server', '$scope', '$rootScope',
        function(db, s, r) {

            s.deleteAll = (t) => {
                r.openConfirm({
                    message: "You want to delete all the objects of type " + t + ' ?',
                    data: {
                        title: "Delete Confirmation"
                    }
                }, () => {
                    db.ctrl(t, 'removeWhen', {}).then((res) => {
                        if (res.ok) {
                            r.okModal('All the objects of type ' + t + ' were deleted from the database.');
                        }
                    })
                });
            };


            $U.expose('s', s);
            r.toggleNavbar(true);
            r.secureSection(s);
            if (r.userIs(['diag', 'client'])) {
                return r.handleSecurityRouteViolation();
            }
            $U.expose('s', s);

            s.months = () => {
                return moment.monthsShort().map((m, k) => k + 1 + ' - ' + m);
            };

            s.menuItems = {
                'Texts': 'texts',
                'Notifications': 'notifications',
                'Logs': 'logs',
                "Tools": 'tools',
                "Price Modifiers": "price-modifiers",
                "Documentation": "documentation",
                "Database": "settings-database",
                "Extract Data": "settings-exportation",
                "Invoice Template": "settings-invoice"
            };

            s.priceModifiers = {
                "Today Monday to Friday (+%)": "todayMondayToFriday",
                "Today Saturday (+%)": "todaySaturday",
                "Today Sunday (+%)": "todaySunday",
                "Tomorrow Monday to Friday (+%)": "tomorrowMondayToFriday",
                "Tomorrow Saturday (+%)": "tomorrowSaturday",
                "Tomorrow Sunday (+%)": "tomorrowSunday",
                "Monday to Friday (+%)": "mondayToFriday",
                "Saturday (+%)": "saturday",
                "Sunday (+%)": "sunday"
            };

            s.item = {
                pricePercentageIncrease: {
                    //today: 0, //deprecated for today[DAY]
                    todayMondayToFriday: 30,
                    todaySaturday: 50,
                    todaySunday: 130,

                    //tomorrow: 0, //deprecated for tomorrow[DAY]
                    tomorrowMondayToFriday: 10,
                    tomorrowSaturday: 40,
                    tomorrowSunday: 110,

                    mondayToFriday: 0,
                    saturday: 30,
                    sunday: 100,
                    VATRate: 20
                }
            };

            function validNumber(input) {
                var rta = !input;
                if (rta) return false;
                rta = isNaN(input);
                if (rta) return false;
                if (!$U.numberBetween(input, 0, 500)) return false;
                return true;
            }

            s.validate = () => {
                var rules = [];
                for (var x in s.item.pricePercentageIncrease) {
                    rules.push([
                        validNumber(s.item.pricePercentageIncrease[x]), '==', false,
                        x + " valid value in  0 .. 500"
                    ]);
                }
                $U.ifThenMessage(rules, r.warningMessage, s.save);
            };
            s.save = () => {
                db.ctrl('Settings', 'save', s.item).then(d => {
                    if (d.ok) {
                        r.infoMessage('Changes saved');
                    }
                });
            };
            s.read = () => {
                db.ctrl('Settings', 'getAll', {}).then(r => {
                    if (r.ok && r.result.length > 0) s.item = r.result[0];
                    else {
                        s.save();
                    }
                });
            };
            s.read();


            s.input = {
                file: null
            };

            s.import = {
                texts: () => {
                    if (!s.input.file) return r.warningMessage('Select a file');
                    var reader = new FileReader();
                    reader.onload = (function(theFile) {
                        return function(e) {
                            try {
                                var arr = JSON.parse(window.decodeURIComponent(e.target.result));
                                arr.map(o => {
                                    delete o._id;
                                    return o;
                                });
                                console.info(arr)

                                r.openConfirm({
                                    message: "Upload " + arr.length + " items? Data will be replaced."
                                }, () => {
                                    
                                    db.ctrl('Text', 'importAll', {
                                        items: arr
                                    }).then(res => {
                                        if (res.ok) {
                                            r.okModal({
                                                message: "Data uploaded ok."
                                            });
                                        }
                                    });
                                });

                            }
                            catch (ex) {
                                r.warningMessage('Import issue, try later.');
                                console.warn(ex);
                            }
                        }
                    })(s.input.file);
                    reader.readAsText(s.input.file);
                }
            }

            //reports
            s.reports = {
                input: {
                    month: moment().month(),
                    diagSeparator: ', ',
                    fileName: "report.csv"
                },
                texts: {
                    all: () => {
                        db.ctrl('Category', 'getAll', {
                            __select: "code description _parent"
                        }).then(rr => {
                            var cats = rr.result;
                            cats.map(item => {
                                if (item._parent) {
                                    var _p = _.cloneDeep(cats.filter(c => c._id == item._parent)[0]);
                                    delete _p._id;
                                    item._parent = _p;
                                }
                            })
                            db.ctrl('Text', 'getAll', {
                                __select: "_category code description content"
                            }).then(res => {
                                if (res.ok && res.result) {
                                    res.result.map(item => {
                                        delete item._id;
                                        delete item._v;
                                        item._category = cats.filter(c => c._id == item._category)[0];
                                    });
                                    res.result.map(item => {
                                        delete item._category._id;
                                        delete item._category._v;
                                    });
                                    s.reports.input.fileName =
                                        'text_' + res.result.length + "_items_" + r.momentDateTime(Date.now()).toString().replaceAll(' ', '_') + '.json';

                                    s.download(res.result, true);
                                }
                            })
                        });

                    }
                },
                orders: {
                    monthReportFilename: "report_orders_month_.csv",
                    monthReport: () => {
                        var date = moment().month(parseInt(s.reports.input.month));
                        s.reports.orders.monthReportFilename = 'report_orders_month_' + date.format('MMMM') + '.csv';
                        db.ctrl('Order', 'getAll', {
                            __select: "_id status _diag address start price priceHT revenueHT diagRemunerationHT diags deliveredAt",
                            __populate: {
                                _diag: "firstName lastName"
                            },
                            __rules: {
                                status: {
                                    $in: ['completed', 'delivered']
                                },
                                deliveredAt: {
                                    $gte: date.startOf('month').toDate().toString(),
                                    $lt: date.endOf('month').toDate().toString()
                                }
                            }
                        }).then(res => {
                            if (res.ok) {
                                console.info(res.result);
                                var rta = [];
                                res.result.forEach(d => {
                                    rta.push({
                                        orderID: d._id,
                                        start_date: r.momentDateTime(d.start),
                                        delivered_date: r.momentDateTime(d.deliveredAt),
                                        status: d.status,
                                        diag_fullname: d._diag.firstName + " " + d._diag.lastName,
                                        address: d.address,
                                        diags_list: _.map(_.pickBy(d.diags, (a) => a == true), (v, k) => k).join(s.reports.input.diagSeparator),
                                        priceTTC: d.price,
                                        priceHT: d.priceHT,
                                        revenueHT: d.revenueHT,
                                        diagRemunerationHT: d.diagRemunerationHT
                                    });
                                });

                                s.download(rta);

                            }
                        });


                        console.log('monthReport! gte ', r.momentDateTime(date.startOf('month').toDate()), 'lt', r.momentDateTime(date.endOf('month').toDate()));
                    }
                }
            };

            s.download = (data, isJSON) => {
                isJSON = isJSON || false;
                if (data.length == 0) return r.okModal('No results');
                r.openConfirm({
                    message: data.length + " items found, extract?",
                    data: {
                        title: (isJSON) ? "Confirmation" : ("Extract Confirmation for " +
                            moment().month(parseInt(s.reports.input.month)).format('MMMM'))
                    }
                }, () => {
                    if (!isJSON) {
                        $U.downloadContent($U.toCSV({
                            data: data
                        }), s.reports.orders.monthReportFilename);
                    }
                    else {
                        $U.downloadContent(window.encodeURIComponent(JSON.stringify(data)), s.reports.input.fileName);
                    }
                })
            }


        }
    ]);


    app.controller('ctrl-settings-invoice', ['server', '$scope', '$rootScope', '$routeParams', 'focus',
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
            //
            check(); //checks when the wysing lib is ready and init the components.

            s.variables = {
                    "{{LOGO}}": "Diagnostical Logo",
                    "{{ORDER_DESCRIPTION}}": "Ex: Pack Vent: ...",
                    "{{ADDRESS}}": "Diag Address",
                    "{{CLIENT_FULLNAME}}": "Particular Client / Agency / Other first & last name",
                    "{{CLIENT_FIRSTNAME}}": "Particular Client / Agency / Other first name",
                    "{{CLIENT_LASTNAME}}": "Particular Client / Agency / Other last name",
                    "{{CLIENT_EMAIL}}": "Particular Client / Agency / Other email",
                    "{{CLIENT_ADDRESS}}": "Particular Client / Agency / Other address",
                    '{{LANDLORDFULLNAME}}': "Landlord Fullname (Agency / Other only)",
                    '{{LANDLORDEMAIL}}': "Landlord Email (Agency / Other only)",
                    '{{LANDLORDPHONE}}': "Landlord Phone (Agency / Other only)",
                    '{{LANDLORDADDRESS}}': "Landlord Address (Agency / Other only)",
                    '{{CREATEDAT}}': "Order creation date Ex: 16/06/2016 10h29",
                    '{{START}}': "Order diag start date Ex: 16/06/2016 10h29",
                    '{{END}}': "Order diag start date Ex: 16/06/2016 10h29",
                    "{{PRICE}}": "Order TTC Price",
                    "{{PRICEHT}}": "Order HT Price",
                    "{{VATRATE}}": "Order VAT Rate Applied",
                    "{{VATPRICE}}": "Order VAT Price Applied",
                    "{{REVENUEHT}}": "Diagnostical Revenue HT Price",
                    "{{DIAGREMUNERATIONHT}}": "Diag Remuneration HT",
                }
                //['PRICE', 'PRICEHT', 'REVENUEHT', 'DIAGREMUNERATIONHT', 'ADDRESS', 'START', 'END'];


            db.ctrl('Order', 'get', {
                __populate: {
                    _client: "email firstName lastName landlordFullName landlordEmail address"
                }
            }).then(res => {
                if (res.ok) {
                    s.randomOrder = res.result;

                }
            });
            //
            s.preview = () => {
                s.item.content = window.encodeURIComponent(tinymce.activeEditor.getContent());
                var html =
                    window.encodeURIComponent(
                        $D.OrderReplaceHTML(window.decodeURIComponent(s.item.content), s.randomOrder, r));
                r.ws.ctrl("Pdf", "view", {
                    html: html
                }).then(res => {
                    if (res.ok) {
                        s.save();
                        var win = window.open(res.result, '_blank');
                        win.focus();
                    }
                    else {
                        res.warningMessage('Server Issue, try later.');
                    }
                });
            };
            //
            s.read = function() {

                db.ctrl('Category', "createUpdate", {
                    code: "DIAGS_SETTINGS",
                    __match: ['code']
                }).then(function(_res) {
                    if (_res && _res.ok && _res.result) {
                        //
                        var _category = _res.result._id;

                        db.ctrl('Text', 'get', {
                            _category: _category,
                            code: 'INVOICE',
                        }).then(function(res) {
                            if (res.ok) {
                                if (res.result) {
                                    s.item = res.result;
                                    tinymce.activeEditor.setContent(window.decodeURIComponent(s.item.content));
                                }
                                else {
                                    db.ctrl('Text', 'createUpdate', {
                                        _category: _category,
                                        code: 'INVOICE',
                                        description: 'diags-invoice-template',
                                        content: window.encodeURIComponent("&nbsp;"),
                                        __match: ['code']
                                    }).then(function(res) {
                                        if (res.ok && res.result) {
                                            s.item = res.result;
                                            tinymce.activeEditor.setContent(window.decodeURIComponent(s.item.content));
                                        }
                                    });
                                }
                            }
                            else {
                                r.warningMessage('Server issue while reading item. Try later.');
                            }
                        });
                        //
                    }
                });


            };
            //
            s.save = function() {
                if (!s.item.code) return r.warningMessage('Code required');
                if (!s.item.description) return r.warningMessage('Description required');
                if (!s.item._category) return r.warningMessage('Page Section required');
                //
                s.item.updatedByHuman = true;
                s.item.content = window.encodeURIComponent(tinymce.activeEditor.getContent());
                db.ctrl('Text', 'save', s.item).then(function() {
                    //r.route('texts');
                    r.infoMessage("Changes saved", 5000);
                });
            };

            function check() {
                if (typeof window.tinymce !== 'undefined') {
                    r.dom(init);
                }
                else setTimeout(check, 100);
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
                initTinyMCE();
                r.dom(s.read, 0);
            }
        }
    ]);



    //
})();