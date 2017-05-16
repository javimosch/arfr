/*global firebase*/
/*global $U*/
(function() {
    function getProvider(providerName) {
        providerName = providerName || 'google';
        var provider = null;
        if (providerName == 'google') {
            provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
        }
        if (providerName == 'github') {
            provider = new firebase.auth.GithubAuthProvider();
            provider.addScope('user:email');
        }
        return provider;
    }

    function login(providerName, force) {
        force = force || false;
        if (!firebase.auth().currentUser || force) {
            firebase.auth().signInWithPopup(getProvider(providerName)).then(function(result) {
                // This gives you a Google Access Token. You can use it to access the Google API.
                var token = result.credential.accessToken;
                // The signed-in user info.
                var user = result.user;
                // [START_EXCLUDE]

                $U.emit('auth-token', token);
                //check();
                // [END_EXCLUDE]
            }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                // [START_EXCLUDE]
                if (errorCode === 'auth/account-exists-with-different-credential') {
                    alert('You have already signed up with a different auth provider for that email.');
                    // If you are using multiple auth providers on your app you should handle linking
                    // the user's accounts here.
                }
                else {
                    console.error(error);
                }
                // [END_EXCLUDE]
            });
            // [END signin]
        }
        else {
            // [START signout]
            //firebase.auth().signOut();
            check(function(data) {
                console.log('data', data);
                for (var x in data.providerData) {
                    if (data.providerData[x].providerId.indexOf(providerName) == -1) {
                        return login(providerName, true);
                    }
                }

            });
            // [END signout]
        }
        // [START_EXCLUDE]
        console.log('quickstart-sign-in-disabled');
        // [END_EXCLUDE]
    }

    function check(cb) {
        // Listening for auth state changes.
        // [START authstatelistener]
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                auth.user = user;
                if (cb) cb(user);
                $U.emit('auth-login', user);
                // [END_EXCLUDE]
            }
            else {
                // User is signed out.
                // [START_EXCLUDE]
                //document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
                //document.getElementById('quickstart-sign-in').textContent = 'Sign in with Google';
                //document.getElementById('quickstart-account-details').textContent = 'null';
                //document.getElementById('quickstart-oauthtoken').textContent = 'null';
                $U.emit('auth-logout');
                // [END_EXCLUDE]
            }
            // [START_EXCLUDE]
            //console.log('quickstart-sign-in-enabled');
            // [END_EXCLUDE]
        });
        // [END authstatelistener]
        //document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
        //console.log('quickstart-sign-in-binded');
    }
    
    function logout(){
        auth.user = null;
        firebase.auth().signOut();
    }
    
    window.ba = window.ba || {};
    var auth = {};
    auth.check = check;
    auth.login = login;
    auth.logout = logout;
    window.ba.auth = auth;
})();