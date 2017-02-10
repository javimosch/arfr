(function() {
    var app = angular.module('app.tools', []);
    app.controller('termitesChecker', ['server', '$scope', '$rootScope', (db, s, r) => {
        s.item = [];
        s.check = () => {
            if (!s.item.address) return r.notify('Address required', 'warning');
            s.departmentHasTermites();
        }

        s.departmentHasTermites = () => {
            if (s.item.department) {
                var code = s.item.postCode.substring(0, 2);
                var has = _.includes(s.termitesDepartments.map(v => (v.toString())), code);
                s.item.hasTermites = has ? 'Yes' : 'No';
                s.item.message = code;
            } else {
                s.item.message = 'department expected.';
            }
        };

        s.termites= ()=>{
        	if(!s.termitesDepartments) return "";
        	return s.termitesDepartments.join(', ');
        };

        db.localData().then(function(data) {
            Object.assign(s, data);
        });


    }]);
})();
