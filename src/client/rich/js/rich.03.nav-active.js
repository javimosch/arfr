/*global $*/
$(function() {
    //header li [active] a href= /services
    $('header li').removeClass('active');
    var url = window.location.href;
    
    if(url.indexOf('/work/')!==-1){
        $('li.work').addClass('active');
        return;
    }
    
    if(url.indexOf('/projects/')!==-1){
        $('li.projects').addClass('active');
        return;
    }
    
    if (url.lastIndexOf('/') == url.length - 1) { //if there is an '/' as the last char
        url = url.substring(0, url.lastIndexOf('/')); // remove last char (/)
    }
    var section = url.substring(url.lastIndexOf('/')); //retrieve section.
    var li, a, aUrl,success=false;
    $('header li').each(function() {
        li = $(this);
        a = li.find('a').first();
        aUrl = a.attr('href');
        if (aUrl.indexOf('/') !== -1) {
            aUrl = aUrl.substring(aUrl.lastIndexOf('/'));
        }
        if (section.toLowerCase() == aUrl.toLowerCase()){
            li.addClass('active');
            success=true;
        }
    });
    if(!success){
        $('li.home').addClass('active');
    }
});