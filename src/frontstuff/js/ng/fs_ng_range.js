/*global angular*/
/*global $*/
/*global $U*/
/*global noUiSlider*/


angular.module('fs_ng_range',[])
.directive('rangeModel', function($rootScope, $timeout, $compile) {
    return {
        restrict: 'A',
        link: function(scope, el, attrs) {
            if (!attrs.rangeValues) throw Error('rangeModel: rangeValues attribute requited.');
            var vals = scope[attrs.rangeValues];
            var handler = el.get(0);
            $timeout(function() {
                el.attr('min', 0);
                el.attr('max', Object.keys(vals).length - 1);
                el.attr('step', 1);


               // console.log('init-range', handler);
                noUiSlider.create(handler, {
                    start: [0],
                    step: 1,
                    range: {
                        'min': [0],
                        'max': [Object.keys(vals).length - 1]
                    }
                });

                handler.noUiSlider.on('change', function() {
                    update();
                });
                 handler.noUiSlider.on('slide', function() {
                    update();
                });

                $rootScope.$apply();
            })

            function update() {
                ///var index = el.val();
                var index = Math.round(parseInt(handler.noUiSlider.get()));
                var val = get(index);
                //console.info('range', index, val);
                set(val,scope);
                $timeout(function() {
                    $rootScope.$apply();
                });
            }

            // el.on('input', update);

            $U.on('render-ranges', function() {
                //console.info('init-render-ranges',$U.val(scope, attrs.rangeModel));
                setDomVal($U.val(scope, attrs.rangeModel), vals);
            });

            function get(index) {
                return vals[Object.keys(vals)[index]];
            }

            function set(val, ss) {
                var split = attrs.rangeModel.split('.');
                split.forEach(word => {
                    if (word == split[split.length - 1]) return;
                    ss = ss[word];
                    if (ss == undefined) throw Error(word, ' is undefined');
                });
                ss[split[split.length - 1]] = val;
                setDomVal(val, vals);
            }

            function setDomVal(val, valsObject) {
                
                
                $rootScope.dom(function() {
                    try {
                        var x = 0;
                        for (var pos in valsObject) {
                            if (val == valsObject[pos]) {
                                break;
                            }
                            else {
                                x++;
                            }
                        }
                        //$("input[type=range]").val(x);
                        handler.noUiSlider.set(x);
                        // console.log('range: set-dom-val-at-', x);
                    }
                    catch (e) {}
                });
            }
        }
    };
});