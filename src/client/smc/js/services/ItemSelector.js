angular.module('shopmycourse.services')

/**
 * @name ItemSelector
 * @function Service
 * @memberOf shopmycourse.services
 * @description Select objects.
 */

.factory('ItemSelector', function($window, lodash, $log) {
    var items = [];
    var matchProperty = 'id';

    function exists(collection, object) {
        return lodash.some(collection, function(value) {
            return value[matchProperty] === object[matchProperty];
        });
    }

    function add(collection, object) {
        collection.push(object);
    }

    function remove(collection, object) {
        return lodash.remove(collection, function(value) {
            return value[matchProperty] === object[matchProperty];
        });
    }

    function toggleSelect(object) {
        if (exists(items, object)) {
            remove(items, object);
            $log.debug('ItemSelector: '+object[matchProperty]+' deselected');
        }
        else {
            add(items, object);
            $log.debug('ItemSelector: '+object[matchProperty]+' selected');
        }
    }

    function getAll() {
        return items;
    }
    function size(){
        return items.length;
    }
    function isSelected(object){
        return exists(items,object);
    }
    return {
        setMatchProperty:function(propertyName){
          matchProperty = propertyName;  
        },
        isSelected:isSelected,
        size:size,
        getAll: getAll,
        toggleSelect: toggleSelect
    };
});
