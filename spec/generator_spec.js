var fs = require('fs');
var path = require('path');
var utils = require(process.cwd() + '/lib/he.utils');

describe("Staticstuff generator common test", function() {
    describe("existance of build directories", function() {
        it("returns true", function(done) {

            utils.ensureDirectory(process.cwd() + '/dist');
            utils.ensureDirectory(process.cwd() + '/dist-production');

            var rta = fs.existsSync(process.cwd() + '/dist');
            rta = rta && fs.existsSync(process.cwd() + '/dist-production');
            expect(rta).toBe(true);
            done();

        });
    });
});

describe("Staticstuff generator common test", function() {
    describe("existance at least two configuration file", function() {
        it("returns number greater than 1", function(done) {

            var rta = fs.readdirSync(process.cwd() + '/configs').length;

            expect(rta).not.toBeLessThan(1);
            done();

        });
    });
});

describe("Staticstuff generator common test", function() {


    function folderExistsInSrc(folder, name) {
        try {
            fs.statSync(path.join(process.cwd(), 'src', folder, name))
            return true;
        }
        catch (err) {
            return false;
        }
    }

    var folders = ['css', 'res', 'js', 'static', 'partials']
    var configFiles = fs.readdirSync(process.cwd() + '/configs');

    configFiles.forEach(s => {
        var projectName = s.replace('config-', '').replace('.js', '');

        describe("existance of required folders for " + projectName, function() {

            folders.forEach(folder => {
                it("returns true when the path exists: " + path.join('src',projectName,folder), function(done) {
                    expect(folderExistsInSrc(projectName,folder)).toBeTruthy()
                    done();
                });
            })

        });
    })




});