/*global gacm*/
function test() {

    gacm.ready(function() {
        
        gacm.once('configured',function(){
            console.log('test success');
        });
        
        gacm.configure({
            serverURL: 'https://maerp-javoche.c9users.io:8081',
            //serverURL:'https://backstuff-getacoursier.herokuapp.com',
            configurationIdentifier: 'gacmobile'
        });
    });
}


var wait = setInterval(() => {
    if (gacm) {
        clearInterval(wait);
        test();
    }
}, 100);
