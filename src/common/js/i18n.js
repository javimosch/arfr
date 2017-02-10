//i18n__data object should exists
//i18n__language = 'en' (example)

if (window.i18n == undefined) {
    window.i18n = {};
}
window.i18n.get = function(code) {
    return window.i18n__data[code][window.i18n__language || 'en'];
};
