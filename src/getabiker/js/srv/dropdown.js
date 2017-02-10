/*global angular*/
(function() {
    var app = angular.module('srv_dropdown', []);
    app.service('dropdown', function($rootScope, server) {
        return {
            inject: function(s,opt) {
                s.dropdownSettings = {
                    setVal: (name, val) => opt.setVal(name,val),
                    getVal: (name) => opt.getVal(name),
                    defaultLabel: "Select"
                };
                s.dropdownSettings = Object.assign(s.dropdownSettings,opt);
                s.dropdownData = (name) => {
                    s.dropdownMetadata = s.dropdownMetadata || {};
                    s.dropdownMetadata[name] = s.dropdownMetadata[name] || {
                        label: ''
                    };
                    return s.dropdownMetadata[name];
                };
                s.dropdownSelect = (name, val, label) => {
                    var data = s.dropdownData(name);
                    data.label = label;
                    s.dropdownSettings.setVal(name, val);
                };
                s.dropdownLabel = (name, items) => {
                    var data = s.dropdownData(name);
                    return s.dropdownSettings.getVal(name) && items[s.dropdownSettings.getVal(name)] || data.label || s.dropdownSettings.defaultLabel;
                };
            }
        };
    });
})();