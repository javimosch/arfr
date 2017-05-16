angular.module('shopmycourse.directives')

/**
 * @name Pickaday
 * @function Directive
 * @memberOf shopmycourse.directives
 * @description Datepicker (date-picker)
 */

.directive('datePicker', function($rootScope, $timeout, $log, DomRefresher, $parse) {
    return {
        scope: false,
        restrict: 'E', //A
        template: '<input type="text" class="date-picker form-control">',
        link: function(scope, elem, attrs) {
            elem = (function() {
                var rootNode = elem.get(0);
                var child = elem.get(0).childNodes[0];
                var parent = elem.get(0).parentNode;
                parent.insertBefore(child, rootNode);
                parent.removeChild(rootNode);
                return window.angular.element(child);
            })(); //
            var el = elem.get(0); //dom element

            var model = $parse(attrs.ngModel);
            var modelSetter = model.assign;

            var picker = new window.Pikaday({
                field: el,
                format: '[Le] dddd DD MMMM YY', // [à] HH[h]mm', //'DD-MM-YY HH[h]mm',
                onSelect: function() {
                    modelSetter(scope, this.getMoment());
                    
                    if(attrs.onSelect){
                        scope[attrs.onSelect](this.getMoment());
                    }
                    
                    //console.log(this.getMoment().format('DD-MM-YY HH[h]mm'));
                },
                firstDay: 1,
                minDate: new Date(2000, 0, 1),
                maxDate: new Date(2020, 12, 31),
                yearRange: [2000, 2020],
                showTime: true,
                autoClose: false,
                use24hour: true,
                i18n: i18n(),
                position: 'bottom right',
                positionLeftAdd: 0,
                reposition:false,
                container: angular.element(attrs.container).get(0)
            });
            picker.show()
            
            function repositionButtomRight(){
                
                function offsetX(){
                    if(attrs.offsetx!=undefined) return parseInt(attrs.offsetx);
                    else return 0;
                }
                
                var popup = angular.element(attrs.container);
                var elemLeft = elem.offset().left+elem.outerWidth();
                var popupLeft = popup.offset().left+popup.innerWidth();
                var minWidth = popupLeft - elem.offset().left;
                var e  = elem;
                var p = popup;
                if(p.offset().left > e.offset().left){
                    e.css('max-width',p.offset().left-e.offset().left+p.find('.pika-single').outerWidth()+offsetX())
                }
            }
            
            angular.element(window).resize(function(){
                picker.adjustPosition();
                repositionButtomRight();
            });
            
            DomRefresher(function(){
                repositionButtomRight();
            });

            //var picker = new window.Pikaday({ field: elem.get(0) });
            //console.log(elem.get(0));


            function i18n() {
                return {
                    previousMonth: 'Mois précédent',
                    nextMonth: 'Mois prochain',
                    months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', "Octobre", "Novembre", "Décembre"],
                    weekdays: ['dimanche', " lundi ", " mardi ", " mercredi ", " jeudi ", " vendredi ", " samedi "],
                    weekdaysShort: ['Dim', 'Mon', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
                };
            }
        }
    };
});
