angular.module('shopmycourse.directives')

/**
 * @name address
 * @function Directive
 * @memberOf shopmycourse.directives
 * @description Google geocomplete directive helper for dom inputs.
 */

.directive('address', function($rootScope, $timeout, $log, DomRefresher) {
    return {
        scope: {
            context: "=scope",
            model: "=model",
            field: "@field",
            change: "&change",
            number: "@number",
            street: "@street",
            city: "@city",
            department: "@department",
            region: "@region",
            country: "@country",
            postCode: "@postCode",
            clear: '=clear'
        },
        restrict: 'AE',
        link: function(scope, elem, attrs) {
            
            $log.debug('Address (directive) Link');
            
            if (!scope.model) {
                throw Error("directive address require a valid model.");
            }

            function fetchCountry(address, callback) {

                var rta = {
                    name: '',
                    code: ''
                };
                var geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({
                    "address": address
                }, function(results) {
                    if (!results) return;
                    for (var i = 0; i < results[0].address_components.length; i++) {
                        for (var j = 0; j < results[0].address_components[i].types.length; j++) {
                            if (results[0].address_components[i].types[j] == "country") {
                                var country = results[0].address_components[i];
                                rta.name = country.long_name;
                                rta.code = country.short_name;
                                callback(rta);
                            }
                        }
                    }
                });

            }

            var tries = 10;

            window._address_elem = elem;


            var ACTIONS = {
                clear: function() {
                    DomRefresher(function() {
                        scope.model[scope.field] = '';
                        elem.val('');
                    });
                }
            }

            function getAddressComponent(address_components, component, type) {
                var element = null;
                address_components.forEach(function(address_component) {
                    //console.log(address_component);
                    if (address_component.types[0] == component) {
                        element = (type == 'short') ? address_component.short_name : address_component.long_name;
                    }
                });
                return element;
            }

            function getZip(data) {
                return getAddressComponent(data, 'postal_code', 'long');
            }

            function getCity(data) {
                return getAddressComponent(data, 'locality', 'long') || getAddressComponent(data, 'administrative_area_level_2', 'long');
            }

            function getDepartment(data) {
                return getAddressComponent(data, 'administrative_area_level_2', 'long');
            }

            function getRegion(data) {
                return getAddressComponent(data, 'administrative_area_level_1', 'long');
            }

            function getCountry(data) {
                return getAddressComponent(data, 'country', 'long');
            }

            function tryLink() {

                $timeout(function() {
                    try {
                        elem.geocomplete({
                            country: "FR"
                        }).bind("geocode:result", onResult);
                        $log.debug('Address (directive): Connected');
                    }
                    catch (e) {
                        if (tries == 0) {
                            var msg = 'Google library issue, address autocomplete feature is temporaly disabled.';
                            $log.warn(msg);
                            $log.warn(e);
                        }
                        else {
                            //$log.debug('Address (directive): trying '+(10-tries)+'/10');
                            tries--;
                            setTimeout(tryLink, 500);
                        }
                    }



                    function onResult(event, result) {
                        scope.model[scope.field] = result.formatted_address;
                        
                        
                        //$log.debug('Address (Directive) onResult',result.formatted_address);
                        
                        //scope.change && scope.change(result.formatted_address);
                        
                        
                        
                        if(typeof scope.change == 'function'){
                            scope.change({
                                value : result.formatted_address
                            });
                        }
                        
                        
                        var data = result.address_components
                        var number, street, city, department, region, country, postCode;

                        number      = getAddressComponent(data, 'street_number', 'long');
                        street      = getAddressComponent(data, 'route', 'long');
                        city        = getCity(data);
                        department  = getDepartment(data);
                        region      = getRegion(data);
                        country     = getCountry(data);
                        postCode    = getZip(data);


                        //$log.info('Address (directive): data',data,postCode,scope);
                        //$log.info('Address (directive): data', result);

                        if (scope.number)       setVal(scope.model, scope.number, number);
                        if (scope.street)       setVal(scope.model, scope.street, street);
                        if (scope.city)         setVal(scope.model, scope.city, city);
                        if (scope.department)   setVal(scope.model, scope.department, department);
                        if (scope.region)       setVal(scope.model, scope.region, region);
                        if (scope.country) {
                            fetchCountry(result.formatted_address, function(d) {
                                                setVal(scope.model, scope.country, d.name);
                            });
                            //setVal(scope.model, scope.country, country);
                        }
                        if (scope.postCode) {
                            //$log.debug('Address (directive): set postcode',postCode);
                            setVal(scope.model, scope.postCode, postCode);
                        }
                        
                        DomRefresher();

                    }

                    function setVal(obj, propertyPath, val) {
                        var split = propertyPath.split('.');
                        var lastIndex = split.length - 1;
                        split.forEach(function(chunk, index) {
                            var isLast = (lastIndex == index);
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
                    read();
                    scope.$watch('model.' + scope.field, read);
                    scope.$apply();


                    if (attrs.name && scope.context) {
                        scope.context[attrs.name] = ACTIONS;
                        $log.debug('Address (Directive): actions binded to scope.' + attrs.name + ' ViewName: ' + scope.$parent.navViewName);
                    }
                    else {
                        $log.warn('Address (Directive): attrs.name attrs.scope required for action binding.');
                    }


                });
            }

            try {
                if (scope.clear != undefined) {

                    scope.model['clear'] = function() {
                        DomRefresher(function() {
                            elem.val('');
                        });
                    }
                    $log.debug('Address (Directive): Clear implemnted');
                }
            }
            catch (e) {
                $log.warn('Address (Directive):', e);
            }

            tryLink();
        }
    };
});
