'use strict';

var assert = require('assert');
var ConfigGenerator = require('../lib/config-generator');
var path = require('path');
var fs = require('fs-extra');

function normalizeCR(content) {
    return content.replace(/\r?\n|\\r/g, '');
}

describe('ConfigGenerator', function () {
    it('should create config file for module without base config file', function (done) {
        // "format" is being passed here as an array.
        // when passed from command line, this should be passed just as as string, for example:
        // '/_/g,-'
        // Then, it will be converted to an array.
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/address*.js',
            format: ['/_/g', '-'],
            ignorePath: false,
            moduleConfig: path.resolve(__dirname, 'modal/bower.json'),
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(normalizeCR(config), normalizeCR(fs.readFileSync(path.resolve(__dirname, 'expected/expected.js'), 'utf-8')));

            done();
        });
    });

    it('should create config file for module without format', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/address*.js',
            ignorePath: false,
            moduleConfig: path.resolve(__dirname, 'modal/bower.json'),
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(normalizeCR(config), normalizeCR(fs.readFileSync(path.resolve(__dirname, 'expected/expected-no-format.js'), 'utf-8')));

            done();
        });
    });

    it('should create config file without module config', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/address*.js',
            ignorePath: false,
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(normalizeCR(config), normalizeCR(fs.readFileSync(path.resolve(__dirname, 'expected/expected-no-module-config.js'), 'utf-8')));

            done();
        });
    });

    it('should create config file with module name in lower case', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/address*.js',
            ignorePath: false,
            lowerCase: true,
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(normalizeCR(config), normalizeCR(fs.readFileSync(path.resolve(__dirname, 'expected/expected-no-module-config.js'), 'utf-8')));

            done();
        });
    });

    it('should create config file without keeping the extension', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/address*.js',
            ignorePath: false,
            keepExtension: true,
            lowerCase: true,
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(normalizeCR(config), normalizeCR(fs.readFileSync(path.resolve(__dirname, 'expected/expected-extension.js'), 'utf-8')));

            done();
        });
    });

    it('should create config file with base', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            base: path.resolve(__dirname, 'modal/config-base.js'),
            config: '__CONFIG__',
            filePattern: '**/address*.js',
            ignorePath: false,
            keepExtension: true,
            lowerCase: true,
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(normalizeCR(config), normalizeCR(fs.readFileSync(path.resolve(__dirname, 'expected/expected-with-base.js'), 'utf-8')));

            done();
        });
    });

    it('should meta config when META is a function', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/meta1.es.js',
            ignorePath: false,
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(normalizeCR(config), normalizeCR(fs.readFileSync(path.resolve(__dirname, 'expected/meta1.js'), 'utf-8')));

            done();
        });
    });

    it('should meta config when META is a label', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/meta2.es.js',
            ignorePath: false,
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(normalizeCR(config), normalizeCR(fs.readFileSync(path.resolve(__dirname, 'expected/meta2.js'), 'utf-8')));

            done();
        });
    });

    it('should generate config when define has only one parameter', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/define-one-param.es.js',
            ignorePath: false,
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(normalizeCR(config), normalizeCR(fs.readFileSync(path.resolve(__dirname, 'expected/define-one-param.js'), 'utf-8')));

            done();
        });
    });

    it('should generate config when define has no dependencies', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/define-no-deps.es.js',
            ignorePath: false,
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(normalizeCR(config), normalizeCR(fs.readFileSync(path.resolve(__dirname, 'expected/define-no-deps.js'), 'utf-8')));

            done();
        });
    });

    it('should normalize the module path', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/windows-path.es.js',
            ignorePath: false,
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(normalizeCR(config), normalizeCR(fs.readFileSync(path.resolve(__dirname, 'expected/windows-path.js'), 'utf-8')));

            done();
        });
    });

    it('should normalize the module full path', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/windows-fullpath.es.js',
            ignorePath: false,
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(normalizeCR(config), normalizeCR(fs.readFileSync(path.resolve(__dirname, 'expected/windows-fullpath.js'), 'utf-8')));

            done();
        });
    });

    it('should not wrap lines which contain more than 74 characters (the default in Recast)', function (done) {
        var tmpFileName = path.join(path.resolve(__dirname, 'modal'), 'long-lines-tmp.es.js');

        fs.copy(path.join(path.resolve(__dirname, 'modal'), 'js/long-lines.es.js'), tmpFileName, function(error) {
            if (error) {
                throw error;
            }

            var configGenerator = new ConfigGenerator({
                args: [path.resolve(__dirname, 'modal')],
                config: '',
                filePattern: tmpFileName,
                ignorePath: false,
                moduleRoot: path.resolve(__dirname, 'modal'),
                skipFileOverride: false
            });

            configGenerator.process().then(function() {
                assert.strictEqual(
                    normalizeCR(fs.readFileSync(path.resolve(__dirname, 'expected/long-lines.js'), 'utf-8')),
                    normalizeCR(fs.readFileSync(tmpFileName, 'utf-8'))
                );

                fs.remove(tmpFileName, function() {
                    done();
                });
            });
        });
    });

    it('should not rewrite "define" calls if "skipFileOverride" option is true even if "namespace" option is present', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/namespace-define-skip-override*.js',
            format: ['/_/g', '-'],
            ignorePath: false,
            moduleConfig: path.resolve(__dirname, 'modal/bower.json'),
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true,
            namespace: 'Liferay'
        });

        configGenerator.process().then(function(config) {

            assert.strictEqual(normalizeCR(config), normalizeCR(fs.readFileSync(path.resolve(__dirname,
                'expected/expected-namespace-define-skip-override-config.js'), 'utf-8')));

            var actual = fs.readFileSync(path.resolve(__dirname, 'modal/js/namespace-define-skip-override.es.js'), 'utf-8');
            var expected = fs.readFileSync(path.resolve(__dirname, 'expected/expected-namespace-define-skip-override.es.js'), 'utf-8');
            assert.strictEqual(normalizeCR(actual), normalizeCR(expected));

            done();
        });
    });

    it('should rewrite "define" calls if "namespace" option is present and "skipFileOverride" option is true', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/namespace-define-override*.js',
            format: ['/_/g', '-'],
            ignorePath: false,
            moduleConfig: path.resolve(__dirname, 'modal/bower.json'),
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: false,
            namespace: 'MyNameSpace'
        });

        configGenerator.process().then(function(config) {
            var actualPath = path.resolve(__dirname, 'modal/js/namespace-define-override.es.js');
            var actual = fs.readFileSync(actualPath, 'utf-8');
            var expected = fs.readFileSync(path.resolve(__dirname, 'expected/expected-namespace-define-override.es.js'), 'utf-8');
            var originalContent = fs.readFileSync(path.resolve(__dirname, 'expected/original/namespace-define-override.es.js'), 'utf-8');

            assert.strictEqual(normalizeCR(actual), normalizeCR(expected));
            // revert to original for next test
            fs.writeFileSync(actualPath, originalContent);
            done();
        });
    });

    it('should not rewrite "custom define" calls even if "namespace" option is present and "skipFileOverride" option is true', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/namespace-define-custom*.js',
            format: ['/_/g', '-'],
            ignorePath: false,
            moduleConfig: path.resolve(__dirname, 'modal/bower.json'),
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: false,
            namespace: 'MyNameSpace'
        });

        configGenerator.process().then(function(config) {
            var actual = fs.readFileSync(path.resolve(__dirname, 'modal/js/namespace-define-custom.es.js'), 'utf-8');
            var expected = fs.readFileSync(path.resolve(__dirname, 'expected/expected-namespace-define-custom.es.js'), 'utf-8');
            assert.strictEqual(normalizeCR(actual), normalizeCR(expected));
            done();
        });
    });

    it('should not rewrite "require" calls if "skipFileOverride" option is true even if "namespace" option is present', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/namespace-require-skip-override*.js',
            format: ['/_/g', '-'],
            ignorePath: false,
            moduleConfig: path.resolve(__dirname, 'modal/bower.json'),
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true,
            namespace: 'MyNameSpace'
        });

        configGenerator.process().then(function(config) {
            var actual = fs.readFileSync(path.resolve(__dirname, 'modal/js/namespace-require-skip-override.es.js'), 'utf-8');
            var expected = fs.readFileSync(path.resolve(__dirname, 'expected/expected-namespace-require-skip-override.es.js'), 'utf-8');
            assert.strictEqual(normalizeCR(actual), normalizeCR(expected));

            done();
        });
    });

    it('should rewrite "define" calls if "namespace" option is present and "skipFileOverride" option is true', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/namespace-require-override*.js',
            format: ['/_/g', '-'],
            ignorePath: false,
            moduleConfig: path.resolve(__dirname, 'modal/bower.json'),
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: false,
            namespace: 'MyNameSpace'
        });

        configGenerator.process().then(function(config) {
            var actualPath = path.resolve(__dirname, 'modal/js/namespace-require-override.es.js');
            var actual = fs.readFileSync(actualPath, 'utf-8');
            var expected = fs.readFileSync(path.resolve(__dirname, 'expected/expected-namespace-require-override.es.js'), 'utf-8');
            var originalContent = fs.readFileSync(path.resolve(__dirname, 'expected/original/namespace-require-override.es.js'), 'utf-8');

            assert.strictEqual(normalizeCR(actual), normalizeCR(expected));
            // revert to original for next test
            fs.writeFileSync(actualPath, originalContent);
            done();
        });
    });

    it('should not rewrite "custom define" calls even if "namespace" option is present and "skipFileOverride" option is true', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/namespace-require-custom*.js',
            format: ['/_/g', '-'],
            ignorePath: false,
            moduleConfig: path.resolve(__dirname, 'modal/bower.json'),
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: false,
            namespace: 'MyNameSpace'
        });

        configGenerator.process().then(function(config) {
            var actual = fs.readFileSync(path.resolve(__dirname, 'modal/js/namespace-require-custom.es.js'), 'utf-8');
            var expected = fs.readFileSync(path.resolve(__dirname, 'expected/expected-namespace-require-custom.es.js'), 'utf-8');
            assert.strictEqual(normalizeCR(actual), normalizeCR(expected));
            done();
        });
    });
});