/*global angular*/
/*global $*/
/*global Pikaday*/
/*global moment*/
/*global $U*/
(() => {
    angular.module('ng_pikaday', [])
        .directive('pikaday', function($rootScope, $timeout, $compile, $parse) {
            return {
                restrict: 'A',
                scope: false,
                link: function(scope, el, attrs) {
                    //console.log('ng pikaday');
                    var model = $parse(attrs.pikaday);
                    var modelSetter = model.assign;
                    //
                    el.addClass('pika-wrapper');
                    el.addClass(attrs.pikaday);
                    //
                    var config = {
                        field: el.get(0),
                        format: 'DD-MM-YY HH[h]mm',
                        onSelect: function() {
                            modelSetter(scope, this.getMoment());
                            console.log(this.getMoment().format('DD-MM-YY HH[h]mm'));
                            $rootScope.dom && $rootScope.dom();
                        },
                        firstDay: 1,
                        minDate: new Date(2000, 0, 1),
                        maxDate: new Date(2020, 12, 31),
                        yearRange: [2000, 2020],
                        showTime: true,
                        autoClose: false,
                        use24hour: true
                    };
                    if (attrs.theme) {
                        config.theme = attrs.theme;
                        el.addClass(attrs.theme);
                    }


                    if (attrs.min) {
                        config.minDate = new Date(attrs.min)
                    }

                    if (attrs.max) {
                        config.maxDate = new Date(attrs.max)
                    }

                    config.onDraw = () => {
                        var minuteEl = $(timepicker.el).find('.pika-select-minute');
                        minuteEl.off('change').on('change', function() {
                            timepicker.hide();
                        });
                    };

                    //console.info(config);

                    var timepicker = new Pikaday(config);

                    //initial set
                    scope.$watch(attrs.pikaday, function() {
                        set();
                    });

                    function set() {
                        var v = $U.val(scope, attrs.pikaday);
                        //
                        if (!v) return;
                        //
                        if (v.toDate && v.format) {
                            timepicker.setMoment(v, true);
                            //console.warn('ng-pikaday ' + attrs.pikaday + ' set', v.toDate());
                        }
                        else {
                            if (isFinite(new Date(v))) {
                                timepicker.setDate(v, true);
                                //console.warn('ng-pikaday ' + attrs.pikaday + ' set', v);
                            }
                            else {
                                //console.warn('ng-pikaday ' + attrs.pikaday + ' invalid date');
                            }
                        }
                        $rootScope.dom && $rootScope.dom();
                    }

                    //setTimeout(set,1000);

                    var id = attrs.pikaday.replace('.', '_');
                    $U.expose('dtp_' + id, timepicker);
                    $U.expose('dtp_' + id + '.model', model);
                }
            };
        });

})();