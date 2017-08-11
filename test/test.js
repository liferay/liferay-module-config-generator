'use strict';

var assert = require('assert');
var ConfigGenerator = require('../lib/config-generator');
var path = require('path');
var fs = require('fs-extra');
var sinon = require('sinon');

var tmpFileName;

function normalizeCR(content) {
    return content.replace(/\r?\n|\\r/g, '');
}

describe('ConfigGenerator', function () {
    afterEach(function(done) {
        if (tmpFileName) {
            fs.remove(tmpFileName, function() {
                done();
            });
        } else {
            done();
        }
    });

    beforeEach(function() {
        tmpFileName = null;
    });

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
            moduleConfig: path.resolve(__dirname, 'modal/package.json'),
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
            moduleConfig: path.resolve(__dirname, 'modal/package.json'),
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

    it('should create config file when module config is object', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/address*.js',
            ignorePath: false,
            moduleConfig: {
                name: 'package-name',
                version: '1.0.0'
            },
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(normalizeCR(config), normalizeCR(fs.readFileSync(path.resolve(__dirname, 'expected/expected-module-config-object.js'), 'utf-8')));

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
        tmpFileName = path.join(path.resolve(__dirname, 'modal'), 'long-lines-tmp.es.js');

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

                done();
            });
        });
    });

    it('should rewrite "define" calls if "namespace" option is present', function (done) {
        tmpFileName = path.join(path.resolve(__dirname, 'modal'), 'namespace-define-override.es.tmp.js');

        fs.copy(path.resolve(__dirname, 'modal/js/namespace-define-override.es.js'), tmpFileName, function(error) {
            if (error) {
                throw error;
            }

            var configGenerator = new ConfigGenerator({
                args: [path.resolve(__dirname, 'modal')],
                config: '',
                filePattern: tmpFileName,
                format: ['/_/g', '-'],
                ignorePath: false,
                moduleConfig: path.resolve(__dirname, 'modal/package.json'),
                moduleRoot: path.resolve(__dirname, 'modal'),
                skipFileOverride: false,
                namespace: 'TestNamespace'
            });

            configGenerator.process().then(function(config) {
                var actual = fs.readFileSync(tmpFileName, 'utf-8');
                var expected = fs.readFileSync(path.resolve(__dirname, 'expected/expected-namespace-define-override.es.js'), 'utf-8');

                assert.strictEqual(normalizeCR(actual), normalizeCR(expected));

                done();
            });
        });
    });

    it('should not rewrite "custom define" calls even if "namespace" option is present', function (done) {
        tmpFileName = path.join(path.resolve(__dirname, 'modal'), 'namespace-define-custom.es.tmp.js');
        fs.copy(path.resolve(__dirname, 'modal/js/namespace-define-custom.es.js'), tmpFileName, function(error) {
            if (error) {
                throw error;
            }

            var configGenerator = new ConfigGenerator({
                args: [path.resolve(__dirname, 'modal')],
                config: '',
                filePattern: tmpFileName,
                format: ['/_/g', '-'],
                ignorePath: false,
                moduleConfig: path.resolve(__dirname, 'modal/package.json'),
                moduleRoot: path.resolve(__dirname, 'modal'),
                skipFileOverride: false,
                namespace: 'TestNamespace'
            });

            configGenerator.process().then(function(config) {
                var actual = fs.readFileSync(tmpFileName, 'utf-8');
                var expected = fs.readFileSync(path.resolve(__dirname, 'expected/expected-namespace-define-custom.es.js'), 'utf-8');
                assert.strictEqual(normalizeCR(actual), normalizeCR(expected));

                done();
            });
        });
    });

    it('should rewrite "require" calls if "namespace" option is present', function (done) {
        tmpFileName = path.resolve(path.resolve(__dirname, 'modal'), 'namespace-require-override.es.tmp.js');

        fs.copy(path.resolve(__dirname, 'modal/js/namespace-require-override.es.js'), tmpFileName, function(error) {
            if (error) {
                throw error;
            }

            var configGenerator = new ConfigGenerator({
                args: [path.resolve(__dirname, 'modal')],
                config: '',
                filePattern: tmpFileName,
                format: ['/_/g', '-'],
                ignorePath: false,
                moduleConfig: path.resolve(__dirname, 'modal/package.json'),
                moduleRoot: path.resolve(__dirname, 'modal'),
                skipFileOverride: false,
                namespace: 'TestNamespace'
            });

            configGenerator.process().then(function(config) {
                var actual = fs.readFileSync(tmpFileName, 'utf-8');
                var expected = fs.readFileSync(path.resolve(__dirname, 'expected/expected-namespace-require-override.es.js'), 'utf-8');

                assert.strictEqual(normalizeCR(actual), normalizeCR(expected));

                done();
            });
        });
    });

    it('should not rewrite "custom require" calls even if "namespace" option is present', function (done) {
        tmpFileName = path.resolve(path.resolve(__dirname, 'modal'), 'namespace-require-custom.es.tmp.js');

        fs.copy(path.resolve(__dirname, 'modal/js/namespace-require-custom.es.js'), tmpFileName, function(error) {
            if (error) {
                throw error;
            }

            var configGenerator = new ConfigGenerator({
                args: [path.resolve(__dirname, 'modal')],
                config: '',
                filePattern: tmpFileName,
                format: ['/_/g', '-'],
                ignorePath: false,
                moduleConfig: path.resolve(__dirname, 'modal/package.json'),
                moduleRoot: path.resolve(__dirname, 'modal'),
                skipFileOverride: false,
                namespace: 'TestNamespace'
            });

            configGenerator.process().then(function(config) {
                var actual = fs.readFileSync(tmpFileName, 'utf-8');
                var expected = fs.readFileSync(path.resolve(__dirname, 'expected/expected-namespace-require-custom.es.js'), 'utf-8');
                assert.strictEqual(normalizeCR(actual), normalizeCR(expected));

                done();
            });
        });
    });

    it('should save a modified file only once', function(done) {
        tmpFileName = path.resolve(path.resolve(__dirname, 'modal'), 'mixed-define-require.es.tmp.js');

        fs.copy(path.resolve(__dirname, 'modal/js/mixed-define-require.es.js'), tmpFileName, function(error) {
            if (error) {
                throw error;
            }

            var configGenerator = new ConfigGenerator({
                args: [path.resolve(__dirname, 'modal')],
                config: '',
                filePattern: tmpFileName,
                format: ['/_/g', '-'],
                ignorePath: false,
                moduleConfig: path.resolve(__dirname, 'modal/package.json'),
                moduleRoot: path.resolve(__dirname, 'modal'),
                skipFileOverride: false,
                namespace: 'TestNamespace'
            });

            var spy = sinon.spy(configGenerator, '_saveFile');

            configGenerator.process().then(function(config) {
                assert.strictEqual(spy.callCount, 1);

                done();
            });
        });
    });
});
