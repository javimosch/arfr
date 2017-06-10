export default function() {
    return ['$db', '$log', function($db, $log) {

        var controllers = [
            'users', 'pages', 'auth', 'texts'
        ];
        var actions = [
            'save', 'update', 'get', 'getAll', 'login', 'isTokenExpired', 'updateToken', 'createAccount', 'generatePassword'
        ];

        controllers.forEach(controller => {
            $db.addController(controller, actions);
            //$log.info('Adding controller ', controller);
        });
    }];
}
