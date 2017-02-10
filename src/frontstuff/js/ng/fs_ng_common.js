/*global $U*/
/*global SS*/
/*global angular*/
/*global _*/
/*global $*/
/*global moment*/
(function() {
    var app = angular.module('fs_ng_common', []);

    app.directive('removeHidden', function($rootScope, $timeout, $compile) {
        return {
            restrict: 'A',
            link: function(scope, el, attrs) {
                $rootScope.dom(function() {
                    el.removeClass('hidden');
                }, 2000);
            }
        };
    });


    app.directive("bindHtmlCompile", ["$compile", function(compile) {
        return {
            restrict: "A",
            link: function(s, el, attrs) {
                s.$watch(function() {
                    return s.$eval(attrs.bindHtmlCompile)
                }, function(e) {
                    el.html(e && e.toString());
                    var f = s;
                    attrs.bindHtmlScope && (f = s.$eval(attrs.bindHtmlScope)), compile(el.contents())(f)

                    var first = el.find(':first-child');
                    var tag = first && first.get(0) && first.get(0).tagName.toUpperCase() || "NONE";
                    if (tag == "SPAN") { //|| tag == "DIV"
                        el.html(first.html());
                    }


                })
            }
        }
    }]);

    app.directive('tableFilter', function(
        $rootScope, $timeout, $compile, $templateRequest, $sce, tpl) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                model: "=model"
            },
            template: "<out></out>", //<h4>tableFilter</h4>
            link: function(s, elem, attrs) {
                var r = $rootScope;
                if (s.model && !s.model.filter) return;
                var filter = s.model.filter.template || '<h5>tableFilter requires filter.template</h5>'
                r.dom(() => {
                    var el = tpl.compile(filter, s);
                    //  console.info('tableFilter', s.model.filter, el);
                    elem.replaceWith(el);



                    //if enter is pressed on any input, call s.model.filter.update with the payload (if exists).
                    el.find('input').on('keyup', (evt) => {
                        //var k = String.fromCharCode(evt.keyCode);
                        if (evt.keyCode.toString() == '13') {
                            s.model.filter.filter();
                        }
                    });

                });

                s.model.filter.filter = function() {
                    s.model.filter.payload = {
                        __regexp: regexpFields() //s.model.filter.fields
                    };

                    //awesome-in filter
                    s.model.filter.payload = assignRuleByType(s.model.filter.payload, 'awesome-in', (data, name, val) => {
                        val = val.replaceAll(' ', '');
                        if (val.charAt(val.length - 1) == ',') {
                            val = val.substring(0, val.length - 1);
                        }
                        var arr = val.split(',');
                        data.__rules = data.__rules || {};

                        data.__rules[name] = {
                            $in: arr
                        }
                        return data;
                    });

                    s.model.filter.payload = assignRuleByType(s.model.filter.payload, 'in', (data, name, val) => {
                        data.__rules[name] = {
                            $in: [val]
                        };
                        return data;
                    });

                    //month-range
                    s.model.filter.payload = assignRuleByType(s.model.filter.payload, 'month-range', (data, name, val) => {
                        var date = moment().month(parseInt(val));
                        data.__rules[name] = {
                            $gte: date.startOf('month').toDate().toString(),
                            $lt: date.endOf('month').toDate().toString()
                        };
                        return data;
                    });

                    s.model.filter.payload = assignPayloadRules(s.model.filter.payload);

                    s.model.filter.payload = Object.assign(s.model.filter.payload,
                        collectionPointersFields());
                    storeSet();
                    if (s.model.filter && s.model.filter.update) s.model.filter.update();
                }

                function assignPayloadRules(data) {
                    var rules = s.model.filter.payloadRules,
                        rule, val, _data;
                    if (!rules) return data;
                    for (var x in rules) {
                        rule = rules[x];
                        if (rule == undefined) continue;
                        val = s.model.filter.fields[x];
                        if (val == undefined) continue;
                        data.__rules = data.__rules || {};
                        _data = rule(data, val);
                        if (!_data) {
                            console.warn('app filter payload rules undefined output for ', x);
                        }
                        else {
                            data = _data;
                        }
                    }
                    return data;
                }

                function assignRuleByType(payload, type, handler) {
                    var fieldValue = null;
                    for (var fieldName in s.model.filter.fields) {
                        fieldValue = s.model.filter.fields[fieldName];
                        if (fieldValue == undefined) continue;
                        if (s.model.filter.rules[fieldName] !== undefined) {
                            if (s.model.filter.rules[fieldName].toLowerCase() == type.toLowerCase()) {
                                payload.__rules = payload.__rules || {};
                                payload = handler(payload, fieldName, fieldValue);
                            }
                        }
                    }
                    return payload;
                }

                s.model.filter.clear = function() {
                    s.model.filter.payload = {};
                    for (var x in s.model.filter.fields) {
                        s.model.filter.fields[x] = '';
                    }
                    storeSet();
                    s.model.filter.fields = {};
                    s.model.filter.update(); //clear filters and search
                };

                s.model.filter.firstTime = function() {
                    storeGet();
                    s.model.filter.update(); //search with store filters (or none).
                }

                function storeSet() {
                    if (s.model.filter.store) {
                        $U.store.set('filter_' + s.model.filter.store + "_" + r.session()._id, s.model.filter.payload);
                    }
                }

                function storeGet() {
                    if (s.model.filter.store) {
                        s.model.filter.payload = $U.store.get('filter_' + s.model.filter.store + "_" + r.session()._id);
                    }
                }

                function regexpFields() {
                    var fields = {};
                    for (var x in s.model.filter.fields) {
                        if (x.charAt(0) == '_') continue; //fields starting with _ are collections pointers.
                        if (s.model.filter.rules[x] && s.model.filter.rules[x] == 'contains') {
                            fields[x] = s.model.filter.fields[x];
                        }
                    }
                    return fields;
                }

                function collectionPointersFields() {
                    var fields = {};
                    for (var x in s.model.filter.fields) {
                        if (x.charAt(0) == '_') {
                            if (s.model.filter.fields[x]) {
                                fields[x] = s.model.filter.fields[x];
                            }
                        }
                        else continue;
                    }
                    return fields;
                }

                s.model.filter.fields = {};
                var filtered = [];
                s.$watch('model.filter.fields', (fields) => {
                    if (!s.model.itemsOriginalRef || s.model.itemsOriginalRef.length == 0) return;
                    filtered = s.model.itemsOriginalRef;
                    var rule = 'contains',
                        val = null,
                        filterVal;
                    for (var x in fields) {
                        filterVal = fields[x] || '';
                        //
                        if (s.model.filter.rules[x]) {
                            rule = s.model.filter.rules[x] || rule;
                            if (rule == 'contains') {
                                filtered = filtered.filter(v => v[x] && v[x].toLowerCase().indexOf(filterVal.toLowerCase()) !== -1);
                            }
                            if (rule == 'match') {
                                filtered = filtered.filter(v => {
                                    val = (x.charAt(0) == '_') ? v[x] && v[x]._id : v[x];
                                    return val && val.toLowerCase() == filterVal.toLowerCase();
                                });
                            }
                            if (rule == 'matchCaseSensiive') {
                                filtered = filtered.filter(v => {
                                    val = (x.charAt(0) == '_') ? v[x] && v[x]._id : v[x];
                                    return val && val == filterVal;
                                });
                            }
                        }
                    }
                    s.model.items = filtered;
                    r.dom();
                }, true);



            }
        };
    });

    app.directive('ctrlDtp', function($rootScope) {
        /*
        <ctrl-dtp options="timePickerKeys"></ctrl-dtp>
        */
        /*
                s.datePickerKeys = {
                    scope: s,
                    modelPath: 'item.keysDateTime',
                    minDate: moment().toDate(),
                    maxDate: moment().toDate(),
                    cls: () => ({ 'form-ctrl': true }),
                    disabled: () => r.state.working(),
                    show: () => true,
                    digest: (self) => {
                        if (!self._set && s.item) {
                            self.minDate = moment(s.item.start).hours(8).minutes(0)._d;
                            self.maxDate = moment(s.item.digStart).subtract(1,'days')._d;
                            //s.item.keyDateTime = 
                            self._set = true;
                        }
                    }
                };*/
        return {
            restrict: 'AE',
            scope: {
                opt: "=options"
            },
            replace: true,
            templateUrl: './views/directives/directive.ctrl.datetimepicker.html',
            link: function(s, el, attrs) {
                var r = $rootScope;
                var opt = s.opt;


                $U.expose(opt.name || 'dtp', s);


                if (!opt.modelPath) throw Error('ctrlDtp require opt.modelPath');
                if (!opt.scope) throw Error('ctrlDtp require opt.scope');
                if (!opt.cls) throw Error('ctrlDtp require opt.cls (function)');
                if (!opt.disabled) throw Error('ctrlDtp require opt.disabled (function)');
                s = Object.assign(s, {
                    scope: opt.scope,
                    opened: false,
                    disabled: () => opt.disabled(),
                    cls: () => opt.cls(),
                    model: opt.initDate || new Date()
                });
                opt.scope.$watch(() => {
                    if (opt.digest) opt.digest(opt);
                })
                opt.scope.$watch(opt.modelPath, (v) => {
                    if (v !== undefined && v !== s.model)
                        s.model = v;
                });
                s.$watch('model', (v) => {
                    setVal(opt.scope, opt.modelPath, v);
                });

                function setVal(obj, propertyPath, val) {
                    var split = propertyPath.split('.');
                    var lastIndex = split.length - 1;
                    split.forEach((chunk, index) => {
                        var isLast = lastIndex == index;
                        if (isLast) return false;
                        obj = obj[chunk] || null;
                        if (!obj) return false;
                    });
                    if (obj) {
                        if (val) obj[split[lastIndex]] = val;
                        return obj[split[lastIndex]];
                    }
                }
            }
        };
    });

    app.directive('ctrlSelect', function($rootScope) {
        return {
            restrict: 'AE',
            scope: {
                opt: "=options"
            },
            replace: true,
            templateUrl: './views/directives/directive.ctrl.select.html',
            link: function(s, el, attrs) {

                s.choiceLabel = (choice) => {
                    if (!choice.label) return choice;
                    return (typeof choice.label !== 'string') ? choice.label() : choice.label;
                };
                s.choiceDisabled = (choice) => {
                    if (choice.disabled) {
                        return choice.disabled();
                    }
                    else return false;
                };

                var r = $rootScope;
                var opt = s.opt;
                if (!opt.modelPath) throw Error('ctrlSelect require opt.modelPath');
                if (!opt.scope) throw Error('ctrlSelect require opt.scope');
                if (!opt.items) throw Error('ctrlSelect require opt.items');
                if (!opt.cls) throw Error('ctrlSelect require opt.cls (function)');
                if (!opt.disabled) throw Error('ctrlSelect require opt.disabled (function)');
                s = Object.assign(s, {
                    scope: opt.scope,
                    label: opt.label || '(Select Item)',
                    //items: opt.items,
                    disabled: () => opt.disabled(),
                    cls: () => opt.cls(),
                    click: (x) => {
                        setVal(opt.scope, opt.modelPath, x.val || x);
                    }
                });
                if (opt.filterWatch) {
                    s.scope.$watch(opt.filterWatch, () => {
                        if (opt.filter) {
                            s.opt.items = _.filter(s.opt.items, (v) => opt.filter(v));
                        }
                    }, true);
                }
                else {
                    s.scope.$watch(() => {
                        if (opt.filter) {
                            s.opt.items = _.filter(s.opt.items, (v) => opt.filter(v));
                        }
                    });
                }




                opt.scope.$watch(opt.modelPath, (v, oldV) => {
                    var arr = s.opt.items.filter(item => ((item.val || item) == v));
                    if (arr.length > 1) {
                        throw Error('ctrlSelect items val need to be unique.');
                    }
                    if (arr.length == 1) {
                        if (arr[0].label) {
                            if (typeof arr[0].label !== 'string') {
                                s.label = arr[0].label(); //fn support
                            }
                            else {
                                s.label = arr[0].label;
                            }
                        }
                        else {
                            s.label = arr[0];
                        }
                        //s.label = arr[0].label || arr[0];
                        if (opt.change) {
                            opt.change(arr[0], opt, () => {
                                //console.info('OLD',oldV);
                                if (v !== oldV) {
                                    setVal(opt.scope, opt.modelPath, oldV);
                                }
                            });
                        }
                        r.dom();
                    }
                    else {
                        if (opt.label) {
                            s.label = opt.label || '(Select Item)'
                        }
                        console.warn('ctrlSelect model has an invalid value. Values expected: ' + JSON.stringify(s.opt.items.map(item => (item.val || item))));
                    }
                });


                function setVal(obj, propertyPath, val) {
                    var split = propertyPath.split('.');
                    var lastIndex = split.length - 1;
                    split.forEach((chunk, index) => {
                        var isLast = lastIndex == index;
                        if (isLast) return false;
                        obj = obj[chunk] || null;
                        if (!obj) return false;
                    });
                    if (obj) {
                        if (val) obj[split[lastIndex]] = val;
                        return obj[split[lastIndex]];
                    }
                }
                if (opt.init) opt.init(opt);
            }
        };
    });

    app.directive('includeReplace', function() {
        return {
            require: 'ngInclude',
            restrict: 'A',
            /* optional */
            link: function(scope, el, attrs) {
                el.replaceWith(el.children());
            }
        };
    });

    app.directive('activeRoute', function($rootScope) {
        return {
            restrict: 'A',
            link: function(scope, el, attrs) {
                function apply() {
                    if ($rootScope.routeIs(attrs.activeRoute)) {
                        el.addClass('active');
                    }
                    else {
                        el.removeClass('active');
                    }
                }
                $rootScope.dom(apply);
                $rootScope.$watch('__route', __route => {
                    $rootScope.dom(apply);
                });
            }
        };
    });

    app.directive('focusOn', function() {
        return function(scope, elem, attr) {
            scope.$on('focusOn', function(e, name) {
                if (name === attr.focusOn) {
                    elem[0].focus();
                }
            });
        };
    });

    app.directive('collapseNav', function($timeout, $rootScope) {
        return {
            restrict: 'AE',
            replace: false,
            //scope:false,
            link: (s, elem, attr) => {
                var r = $rootScope;
                r.dom(() => {
                    elem.find('li').on('click', () => {
                        r.dom(() => {
                            var w = $(window).width();
                            if (w < 768) {
                                elem.collapse('hide');
                            }
                        });
                    });
                });
            }
        }
    });




    app.factory('focus', function($rootScope, $timeout) {
        return function(name) {
            $timeout(function() {
                $rootScope.$broadcast('focusOn', name);
            });
        }
    });

    app.directive('crudModal', function($rootScope, $timeout, $compile, $uibModal) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                open: '=open',
                close: '=close'
            },
            template: '<output></output>',
            link: function(s, elem, attrs) {
                var r = $rootScope;
                var fire = (n, p, ctx) => {
                    if (s.evts) {
                        s.evts[n] = s.evts[n] || [];
                        s.evts[n].forEach((cb) => {
                            if (ctx) {
                                cb.call(ctx, p);
                            }
                            else {
                                cb(p);
                            }
                        })
                    }
                };
                var crudModal = s;
                s.open = function(opt) {
                    s.evts = opt.evts;
                    if (!opt.templateUrl) {
                        throw Error('crudModal needs templateUrl');
                    }
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: opt.templateUrl,
                        controller: function($scope, $uibModalInstance) {
                            var s = $scope;
                            s.fire = (n, p) => fire(n, p, s);
                            Object.assign(s, opt);
                            s.save = s.validate = () => {
                                if (s.validate && s.validate.when && s.validate.fail) {
                                    $U.ifThenMessage(s.validate.when(s), s.validate.fail(s), () => {
                                        s.close();
                                    });
                                }
                                else {
                                    s.close();
                                }
                            };
                            s.close = () => {
                                $uibModalInstance.close();
                                opt.callback(s.item);
                            };
                            s.closeSilent = () => {
                                $uibModalInstance.close();
                            };
                            s.redirect = (url) => {
                                r.params = {
                                    item: s.item
                                };
                                r.route(url);
                                s.closeSilent();
                            };
                            s.cancel = function() {
                                $uibModalInstance.dismiss('cancel');
                            };
                            fire('init', null, s);
                        }
                    });
                };
            }
        };
    });

    app.directive('address', function($rootScope, $timeout) {
        return {
            scope: {
                model: "=model",
                field: "@field",
                change: "=change",
                number: "@number",
                street: "@street",
                city: "@city",
                department: "@department",
                region: "@region",
                country: "@country",
                postCode: "@postCode"
            },
            restrict: 'AE',
            link: function(scope, elem, attrs) {
                if (!scope.model) {
                    throw Error("directive address require a valid model.");
                }
                $timeout(function() {
                    initialize(0);
                });

                function initialize(times) {
                    try {
                        elem.geocomplete().bind("geocode:result", onResult);
                    //    console.log('ng address initialized');
                    }
                    catch (e) {
                        if (times <= 10) {
                            return ((t) => {
                                $timeout(function() {
                                    initialize(t);
                                    console.warn('ng address looking for google api', t,e);
                                }, 1000);
                            })(times+1);
                        }
                        else {
                            var msg = 'Google library issue, address autocomplete feature is temporaly disabled.';
                            return console.warn(msg);
                        }
                    }
                    read();
                    scope.$watch('model.' + scope.field, read);
                    scope.$apply();
                }

                function onResult(event, result) {
                    scope.model[scope.field] = result.formatted_address;
                    scope.change && scope.change(result.formatted_address);
                    var data = result.address_components.map(v => (v.long_name));
                    var number, street, city, department, region, country, postCode;
                    if (data.length == 4) {
                        number = '';
                        street = data[0];
                        city = data[1];
                        department = data[1];
                        region = '';
                        country = data[2];
                        postCode = data[3];
                    }
                    if (data.length == 5) {
                        number = '';
                        street = data[0];
                        city = data[0];
                        department = data[1];
                        region = data[2];
                        country = data[3];
                        postCode = data[4];
                    }
                    if (data.length === 6) {
                        number = '';
                        street = data[0];
                        city = data[1]
                        department = data[2];
                        region = data[3];
                        country = data[4];
                        postCode = data[5];
                    }
                    if (data.length === 7) {
                        number = data[0];
                        street = data[1];
                        city = data[2]
                        department = data[3];
                        region = data[4];
                        country = data[5];
                        postCode = data[6];
                    }
                    if (scope.number) setVal(scope.model, scope.number, number);
                    if (scope.street) setVal(scope.model, scope.street, street);
                    if (scope.city) setVal(scope.model, scope.city, city);
                    if (scope.department) setVal(scope.model, scope.department, department);
                    if (scope.region) setVal(scope.model, scope.region, region);
                    if (scope.country) {
                        $U.fetchCountry(result.formatted_address).then(function(d) {
                            setVal(scope.model, scope.country, d.name);
                        });
                        //setVal(scope.model, scope.country, country);
                    }
                    if (scope.postCode) setVal(scope.model, scope.postCode, postCode);
                    $U.expose('address', Object.assign(result, scope));
                    r.dom();
                }

                function setVal(obj, propertyPath, val) {
                    var split = propertyPath.split('.');
                    var lastIndex = split.length - 1;
                    split.forEach((chunk, index) => {
                        var isLast = lastIndex == index;
                        if (isLast) return false;
                        obj = obj[chunk] || null;
                        if (!obj) return false;
                    });
                    if (obj) {
                        if (val) obj[split[lastIndex]] = val;
                        return obj[split[lastIndex]];
                    }
                }

                function read() {
                    $timeout(function() {
                        if (scope.model[scope.field] !== '') {
                            elem.geocomplete("find", scope.model[scope.field]);
                        }
                        scope.$apply();
                    });
                }
            }
        };
    });


    app.directive('debug', function($rootScope, $timeout, server, $compile) {
        return {
            scope: {
                show: "=show"
            },
            restrict: 'AE',
            replace: true,
            template: '<div><i ng-show="show" ng-click="click()" class="link fa fa-bug fa-lg fixed left-1 bottom-1 always-on-top"><input disabled type="checkbox" ng-click="stop()" ng-model="check"></i><span data-output></span></div>',
            link: function(s, elem, attrs) {
                var r = $rootScope;
                s.check = true;
                s.opt = {
                    onClose: () => {
                        r.logger.clearErrors();
                    }
                };

                s.stop = () => window.event.stopPropagation();
                s.click = () => {
                    var log = r.logger.pending();
                    if (log) {
                        s.create(log, 'info');
                    }

                    var err = r.logger.errors();
                    if (err) {
                        s.create(err, 'danger');
                    }

                };



                s.$watch('check', (v) => {
                    if (v) {
                        if (s.checking) clearInterval(s.checking);
                        s.checking = setInterval(() => {
                            if (r.logger.hasErrors()) {
                                r.dom(() => {
                                    if (elem.find('[data-output] .alert-danger').length === 0) {
                                        s.create(r.logger.errors(), 'danger');
                                        r.logger.clearErrors();
                                    }
                                });
                            }
                        }, 1000);
                        window.onerror = (err) => {
                            s.create(err, 'danger');
                        };
                    }
                    else {
                        if (s.checking) clearInterval(s.checking);
                        window.onerror = (err) => {};
                    }
                });



                s.create = (msg, type) => {
                    return console.warn('[DEBUG][' + (type === 'danger' ? 'ERROR' : 'WARNING') + '] ' + msg);

                    //msg = JSON.stringify(msg);
                    s.msgs = s.msgs || {};
                    var cls = "always-on-top fixed overlay limit-h-200 fullwidth " + ((type === 'danger') ? 'bottom-1' : 'top-1');
                    var el = $compile("<my-alert opt='opt' message='" + msg + "' type='alert-" + (type || 'danger') + "' cls='" + cls + "' />")(s);
                    if (s.msgs[type] !== undefined) {
                        s.msgs[type].alert('close')
                    }
                    s.msgs[type] = el;
                    r.dom(() => {
                        elem.find('[data-output]').append(el);
                    });
                }

                setTimeout(() => {
                    if (server.URL().indexOf('localhost') !== -1) {
                        s.show = true;
                        r.dom();
                    }
                }, 5000);
                //console.log('directive.debug.linked');
            }
        };
    });
    app.directive('spinner', function($rootScope, $timeout) {
        return {
            scope: {
                show: "=show"
            },
            restrict: 'AE',
            replace: true,
            templateUrl: SS.ROOT + 'templates/common/fs.ng.spinner.html',
            link: function(scope, elem, attrs) {
                //console.log('directive.spinner.linked');
            }
        };
    });

    app.directive('checkBox', function($rootScope, $timeout) {
        return {
            scope: {
                val: "=val",
                arr: "=push"
            },
            restrict: 'AE',
            replace: true,
            template: "<input type='checkbox'/>",
            link: function(scope, elem, attrs) {
                $timeout(function() {
                    scope.$apply(function() {
                        elem.value = scope.val;
                        elem.on('change', function() {
                            var checked = elem.get(0).checked;
                            if (checked) {
                                scope.arr = scope.arr || [];
                                scope.arr.push(scope.val);
                            }
                            else {
                                _.remove(scope.arr, function(e) {
                                    return e === scope.val;
                                });
                            }
                            //console.log(scope.arr);
                        });
                    });
                });

            }
        };
    });


    app.directive('notify', function($rootScope, $timeout, tpl) {
        return {
            scope: {
                message: "@message",
                type: "@type",
                cls: "@cls",
                scroll: "=scroll",
                opt: "=opt",
                evts: "=evts",
                settings: "=settings"
            },
            restrict: 'AE',
            replace: false,
            //templateUrl: './views/common/popups/popup-notify.html',
            //template: '<output></output>',
            link: function(scope, elem, attrs) {
                var r = $rootScope;
                var s = scope;

                //console.log('debug ng notify');

                if (!attrs.template && !attrs.templateUrl) {
                    return console.error('debug notify template / template-url required.');
                }
                if (attrs.template) {
                    elem.replaceWith(tpl.compileRaw(attrs.template, s)); //raw html
                    console.info('notify raw html');
                }
                else {
                    if (attrs.templateUrl) {
                        var html = $.ajax({
                            url: attrs.templateUrl,
                            async: false
                        });
                        //console.log('notify ajax rta ',html);
                        if (!html || html.status && html.status == 404) {
                            elem.replaceWith(tpl.compile(attrs.templateUrl, s)); //template cargado
                            console.info('notify loading from cache');
                        }
                        else {
                            //return console.log('html cargado', html);
                            var el = tpl.compileRaw(html.responseText, s);
                            elem.html('').append(el);
                            r.dom();
                        }
                    }
                    else {
                        console.error('notify: template / template-url expected');
                    }
                }

                if (s.settings && typeof s.settings == 'string') {
                    var fixedJSON = s.settings.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
                    s.settings = JSON.parse(fixedJSON);
                }

                //console.log('notify settings', s.settings);


                $timeout(function() {
                    scope.$apply(function() {
                        elem.find('.alert').addClass(scope.type || 'alert-danger');
                        if (scope.cls) {
                            elem.find('.alert').addClass(scope.cls);
                        }
                    });
                });
                scope.clickDismiss = () => {
                    if (s.settings && s.settings.clickDismissable === false) {
                        if (s.opt && !s.opt.clickDismissable) return;
                    }
                    scope.dismiss();
                };
                scope.dismiss = () => {
                    //console.log('notify dismiss');
                    elem.remove()
                };


                if (s.opt && s.opt.duration) {
                    r.dom(s.dismiss, s.opt.duration);
                }
                else {
                    if (_.includes(['alert-info', 'alert-success'], s.type)) r.dom(scope.dismiss, 2000);
                    if (_.includes(['alert-danger', 'alert-warning'], s.type)) r.dom(scope.dismiss, 10000);
                }

                if (s.settings.scroll == true) {
                    r.dom($U.scrollToTop);
                }

            }
        };
    });

    app.directive('myAlert', function($rootScope, $timeout) {
        return {
            scope: {
                message: "@message",
                type: "@type",
                cls: "@cls",
                scroll: "=scroll",
                opt: "=opt",
                evts: "=evts"
            },
            restrict: 'AE',
            replace: true,
            templateUrl: './views/directives/directive.alert.html',
            link: function(scope, elem, attrs) {
                var s = scope;
                var r = $rootScope;
                var fireEvent = (n) => {
                    if (s.evts) {
                        s.evts[n] = s.evts[n] || [];
                        s.evts[n].forEach((cb) => {
                            cb();
                        })
                    }
                };
                $timeout(function() {
                    scope.$apply(function() {
                        elem.addClass(scope.type || 'alert-danger');
                        if (scope.cls) {
                            elem.addClass(scope.cls);
                        }
                    });
                });
                scope.dismiss = () => {
                    //
                    elem.alert('close');
                    fireEvent('close');
                    if (scope.opt && scope.opt.onClose) {
                        scope.opt.onClose();
                    }
                };
                scope.$watch('message', (v) => {
                    elem.find('[data-message]').html(v);
                    if (v && scope.scroll) {
                        r.dom(() => {
                            $('html, body').animate({
                                scrollTop: elem.offset().top
                            }, 500);
                        });
                    }
                });

            }
        };
    });

    app.directive('myAlerts', function($rootScope, $timeout, $compile) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                add: '=add',
                directive: '@directive', //custom directive to be created
                stacked: '=stacked',
                settings: '@settings'
            },
            template: '<output></output>',
            link: function(s, elem, attrs) {
                //console.log('my-alerts directive');
                var r = $rootScope;
                //s.stacked = s.stacked === 'true';
                s.decodeMessage = function(msg) {
                    if (typeof msg == 'string') {
                        return msg;
                    }
                    else {
                        return JSON.stringify(msg);
                    }
                };
                s._stacked = [];
                s.evts = {
                    'close': [onClose]
                };
                var fireEvent = (n) => {
                    if (s.evts) {
                        s.evts[n] = s.evts[n] || [];
                        s.evts[n].forEach((cb) => {
                            cb();
                        })
                    }
                };

                function onClose() {
                    if (s.stacked) {
                        s.el = null;
                        if (s._stacked.length === 0) return;
                        var p = s._stacked[0];
                        s._stacked = s._stacked.slice(1);
                        s.add(p.message, p.type, p.timeout, p.scroll, p.opt);
                    }
                }

                s.add = function(message, type, timeout, scroll, opt) {
                    var msg = s.decodeMessage(message);

                    if (type && typeof type !== 'string') {
                        opt = type;
                        type = opt.type || undefined;
                    }

                    if (timeout && typeof timeout === 'object') {
                        opt = timeout;
                        timeout = undefined;
                    }
                    if (opt && opt.scroll === true) {
                        scroll = true;
                    }

                    /*if (s.stacked) {
                        if (s.el) {
                            return s._stacked.push({
                                message: message,
                                type: type,
                                timeout: timeout,
                                scroll: scroll,
                                opt: opt
                            });
                        }
                    } else {*/
                    if (s.el) {
                        s.el.alert('close');
                    }
                    //}

                    var directive = s.directive || 'my-alert';
                    s.opt = opt;
                    var el = $compile("<" + directive + " settings='settings' evts='evts' opt='opt' scroll='" + scroll + "' message='" + msg + "' type='alert-" + (type || 'danger') + "' template-url='" + attrs.templateUrl + "'/>")(s);

                    //console.log('debug alert attr templateUrl',attrs.templateUrl);

                    s.el = el;
                    elem.html('').append(el);
                    if (timeout && directive === 'my-alert') {
                        r.dom(function() {
                            elem.html('');
                            fireEvent('close');
                        }, timeout);
                    }
                };

                if (s.directive == 'notify') {
                    r.notify = s.add;
                    r.message = s.add;
                    //console.log('notify-directive-added-to-rootscope');
                }

                window.ss = s;
                //console.log('directive:my-alerts:linked');
            }
        };
    });

    app.directive('modalCustom', function($rootScope, $timeout, $compile, $uibModal) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                open: '=open'
            },
            template: '<output></output>',
            link: function(s, elem, attrs) {
                if (!attrs.templateUrl) throw Error('modalCustom attr templateUrl required.');
                s.open = function(opt, confirmCallback) {
                    opt = opt || {};
                    var message = '';
                    if (typeof opt === 'string') {
                        message = opt;
                    }
                    else {
                        message = opt.message || '';
                    }
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: opt.templateUrl || attrs.templateUrl,
                        controller: function($scope, $uibModalInstance) {
                            $scope.data = opt.data;
                            $scope.message = message;

                            $scope.messageEl = opt.messageEl || null;


                            $scope.yes = function() {
                                $uibModalInstance.close();
                                if (confirmCallback) {
                                    confirmCallback();
                                }
                            };
                            $scope.cancel = function() {
                                $uibModalInstance.dismiss('cancel');
                            };
                            $U.expose('modalCustom', $scope);
                        },
                    });
                };
            }
        };
    });

    app.directive('modalConfirm', function($rootScope, $timeout, $compile, $uibModal) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                open: '=open'
            },
            template: '<output></output>',
            link: function(s, elem, attrs) {
                //console.info('directive:modalSure:link:start');
                s.open = function(opt, okCallback) {
                    opt = opt || {};
                    var message = '';
                    if (typeof opt === 'string') {
                        message = opt;
                        //opt = undefined;
                    }
                    else {
                        message = opt.message || '';
                    }

                    //
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: opt.templateUrl || 'views/directives/directive.modal.sure.html',
                        controller: function($scope, $uibModalInstance) {
                            $scope.data = opt.data;
                            $scope.message = message;
                            $scope.yes = function() {
                                $uibModalInstance.close();
                                if (okCallback) {
                                    okCallback();
                                }
                            };
                            $scope.cancel = function() {
                                $uibModalInstance.dismiss('cancel');
                            };
                        },
                        //size: '',
                        //resolve: {}
                    });
                };
                //console.log('directive:modalSure:linked');
            }
        };
    });



    app.directive('dynamicTable', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                model: "=model"
            },
            templateUrl: SS.ROOT+'templates/common/fs.ng.dynamic-table.html',
            link: function(s, elem, attrs) {
                var r = $rootScope;

                //
                $rootScope.$watch('hasMouse', (v) => {
                    s.hasMouse = v;
                });
                //

                var n = attrs.name;
                if (!s.model) {
                    console.error('directive.table: no model present');
                    return
                }
                s.click = (item, index) => {
                    if (s.model.click) {
                        s.model.click(item, index);
                    }
                };
                s.buttons = s.model.buttons || null;
                s.columns = s.model.columns || [];
                s.model.items = s.model.items || [];

                s.paginationTotalItems = 1;

                function objUpdate(obj1, obj2, preserveFields) {
                    var rta = obj1;
                    Object.keys(obj2).forEach(k => {
                        for (var x in preserveFields) {
                            if (preserveFields[x] == k && typeof obj1[k] !== 'undefined') return; //skips fields who need to be preserved. (only when they exists on obj1).
                        }
                        rta[k] = obj2[k];
                    })
                    return rta;
                }

                var paginationDefaults = {
                    currentPage: 1,
                    maxSize: 5,
                    itemsPerPage: 10,
                    total: 1,
                    changed: () => {
                        if (s.model.paginate) s.model.paginate(items => {
                            s.model.items = items;
                            r.dom();
                        });
                    },
                    update: (p) => {
                        //s.model.pagination.itemsPerPage=p.itemsLength;
                        //s.paginationTotalItems = s.model.pagination.itemsPerPage * p.numPages;
                        s.model.pagination.total = p.total;
                    }
                };
                s.model.pagination = s.model.pagination && objUpdate(s.model.pagination, paginationDefaults, ['itemsPerPage']) || paginationDefaults;

                s.model.update = (items, data) => {
                    s.model.pagination.total = items.length;
                    s.model.items = items;
                    s.model.itemsOriginalRef = items;
                    if (!s.data) {
                        s.data = data;
                    }
                };

                s.model.columnFilter = function(item) {
                    return item.disabled == undefined || !item.disabled == true;
                };

                if (s.model.init) {
                    s.model.init();
                }
                s.model.itemsOriginalRef = s.model.items;
                $U.expose('table', s);
            }
        };
    });

    app.directive('appendChild', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce) {
        return {
            restrict: 'AE',
            replace: false,
            scope: {
                child: "=child",
            },
            link: function(s, elem, attrs) {
                if (s.child) {
                    elem.html('').append(s.child);
                }
            }
        };
    });


    app.directive('htmlContent', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce) {
        return {
            restrict: 'AE',
            replace: false,
            scope: {
                html: "&html",
            },
            link: function(s, elem, attrs) {
                if (!s.html) return;
                $rootScope.dom(() => {
                    elem.html(s.html);
                });
            }
        };
    });

    app.directive('timeRange', function($rootScope, $timeout, $compile, $uibModal) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                open: '=open'
            },
            template: '<output></output>',
            link: function(s, elem, attrs) {
                s.open = function(opt) {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'views/directives/directive.modal.timeRange.html',
                        controller: function($scope, $uibModalInstance) {
                            var s = $scope;
                            s.title = opt.title;

                            if (!s.title) {
                                s.title = "Time Range";
                                if (opt.action && opt.action === 'edit') {
                                    s.title += ' - Edition';
                                }
                                else {
                                    s.title = 'New ' + s.title;
                                }
                            }
                            s._opt = opt;
                            window.edit = s;
                            s.days = (() => {
                                var o = {
                                    label: 'Day',
                                    selected: '',
                                    items: [],
                                    val: null,
                                    select: (val) => {
                                        o.items.forEach((v) => {
                                            if (v.val.toString() == val.toString()) {
                                                o.click(v);
                                            }
                                        });
                                    },
                                    click: (v) => {
                                        o.selected = v.label || v;
                                        o.val = v.val;
                                        if (s.start.val) {
                                            s.start.val = moment(s.start.val);
                                            s.start.val.day((o.val.toString() === '-1') ? 1 : o.val);
                                        }
                                        if (s.end.val) {
                                            s.end.val = moment(s.end.val);
                                            s.end.val.day((o.val.toString() === '-1') ? 1 : o.val);
                                        }
                                    }
                                };
                                var m = moment();
                                o.items.push({
                                    label: "(Choice a day)",
                                    val: ''
                                }, {
                                    label: "Every day",
                                    val: '-1'
                                });
                                for (var x = 1; x <= 7; x++) {
                                    m.day(x);
                                    o.items.push({
                                        label: m.format('dddd'),
                                        val: x
                                    });
                                }
                                o.selected = o.items[0].label;
                                return o;
                            })();
                            var timePickerData = (() => {
                                return (m) => {
                                    return {
                                        hstep: 1,
                                        mstep: 10,
                                        repeat: '',
                                        minDate: moment().date(1),
                                        val: m || moment().hour(9).minutes(0)
                                    };
                                };
                            })();
                            s.start = timePickerData(opt.start);
                            s.end = timePickerData(opt.end);
                            s.repeat = 'none';
                            s.daySelection = () => s.repeat !== 'none';
                            s.datepicker = {
                                val: undefined,
                                minDate: moment().add(1, 'day'),
                                maxDate: moment().add(2, 'month'),
                                initDate: new Date()
                            };
                            s.$watch('repeat', (v) => {
                                if (v === 'day') s.days.select(-1);
                            })
                            s.validate = () => {

                                if (!s.description) {
                                    //s.message('Description required', 'warning', 2000);
                                    //return false;
                                }
                                //if (s.repeat === 'none' && !s.datepicker.val) {
                                //  s.message('Choice a day from the datepicker', 'warning', 2000);
                                //return false;
                                //}
                                if (s.repeat == 'week' && s.days.val.toString() === '-1') {
                                    s.message('Choice a day', 'warning', 2000);
                                    return false;
                                }
                                if (s.repeat === 'none' && s.datepicker.val == undefined) {
                                    s.message('Choice a day in the calendar', 'warning', 2000)
                                    return;
                                }
                                if (!s.start.val) {
                                    s.message('Choice a valid start time.');
                                    return;
                                }
                                if (!s.end.val) {
                                    s.message('Choice a valid end time.');
                                    return;
                                }

                                if (moment(s.start.val).isAfter(moment(s.end.val))) {
                                    s.message('Start time need  to be before end time.');
                                    return;
                                }

                                try {
                                    var _d = moment(s.start.val);
                                    _d = moment(s.end.val);

                                    if (s.repeat === 'none') {
                                        s.start.val = moment(s.datepicker.val).hour(moment(s.start.val).hour()).minutes(moment(s.start.val).minutes()).toDate();
                                        s.end.val = moment(s.datepicker.val).hour(moment(s.end.val).hour()).minutes(moment(s.end.val).minutes()).toDate()
                                    }

                                }
                                catch (e) {
                                    s.message('Invalid time', 'warning', 2000);
                                    return false;
                                }


                                return true;
                            };
                            s.save = function() {
                                if (!s.validate()) return;
                                $uibModalInstance.close();
                                var rta = {
                                    description: s.description || '',
                                    start: s.start.val,
                                    end: s.end.val,
                                    type: opt.type,
                                    repeat: s.repeat
                                };
                                if (opt.action == 'edit') {
                                    rta._user = opt.item._user;
                                    rta._id = opt.item._id;
                                }
                                opt.callback(rta);
                            };
                            s.cancel = function() {
                                $uibModalInstance.dismiss('cancel');
                            };
                            if (!opt.action) {
                                throw Error('directive timeRange open require arg.action');
                            }
                            if (opt.action == 'new') {

                            }
                            if (opt.action === 'edit') {
                                var start = moment(opt.item.start);
                                s.repeat = opt.item.repeat;
                                s.description = opt.item.description;
                                s.start.val = opt.item.start;
                                s.end.val = opt.item.end;
                                opt.type = opt.item.type;
                                s.days.val = start.day();
                                s.days.select(s.days.val);
                                if (s.repeat == 'day') {
                                    s.days.val = -1;
                                }
                                if (s.repeat == 'none') {
                                    s.datepicker.val = opt.item.start;
                                }
                            }
                        }
                    });
                };
                //console.log('directive:timeRange:linked');
            }
        };
    });


})();