angular.module('ctrl-bo-setup', []).controller('ctrl-bo-setup', ['$scope', 'appApi', '$timeout', 'appGui', 'appSettings',function(s, appApi, $timeout, appGui, appSettings) {

    const CATEGORIES = [{
        _parent: null,
        code: 'i18n',
        description: 'Root for i18n registries'
    }];

    s.setupLangTexts = () => {
        appApi.texts.custom('setupMultilanguageTexts', {
            appName: appSettings.appName
        }).then(() => {
            appGui.infoMessage('Done!');
        }).error(msg => {
            appGui.warningMessage(msg);
        }).on('validate', msg => {
            appGui.warningMessage(msg);
        });
    };

    s.setupCategories = (left) => {
        left = left || _.clone(CATEGORIES);
        if (left.length > 0) {
            var payload = left[0];
            payload.__match = {
                code: payload.code
            };
            appApi.categories.save(payload).then(r => {
                $timeout(() => {
                    s.setupCategories(left.slice(1));
                }, 200);
            }).error(msg => {
                appGui.warningMessage(msg);
            }).on('validate', msg => {
                appGui.warningMessage(msg);
            });
        }
        else {
            appGui.infoMessage('Done!');
        }
    };
}]);
