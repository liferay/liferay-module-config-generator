'use strict';

var assert = require('assert');
var ConfigGenerator = require('../lib/config-generator');
var fs = require('fs');
var path = require('path');

describe('ConfigGenerator', function () {
    it('should create config file for module without base config file', function (done) {
        // "format" is being passed here as an array.
        // when passed from command line, this should be passed just as as string, for example:
        // '/_/g,-'
        // Then, it will be converted to an array.
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/*.js',
            format: ['/_/g', '-'],
            ignorePath: false,
            moduleConfig: path.resolve(__dirname, 'modal/bower.json'),
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(config, fs.readFileSync(path.resolve(__dirname, 'expected/expected.js'), 'utf-8'));

            done();
        });
    });

    it('should create config file for module without format', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/*.js',
            ignorePath: false,
            moduleConfig: path.resolve(__dirname, 'modal/bower.json'),
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(config, fs.readFileSync(path.resolve(__dirname, 'expected/expected-no-format.js'), 'utf-8'));

            done();
        });
    });

    it('should create config file without module config', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/*.js',
            ignorePath: false,
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(config, fs.readFileSync(path.resolve(__dirname, 'expected/expected-no-module-config.js'), 'utf-8'));

            done();
        });
    });

    it('should create config file with module name in lower case', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/*.js',
            ignorePath: false,
            lowerCase: true,
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(config, fs.readFileSync(path.resolve(__dirname, 'expected/expected-no-module-config.js'), 'utf-8'));

            done();
        });
    });

    it('should create config file without keeping the extension', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            config: '',
            filePattern: '**/*.js',
            ignorePath: false,
            keepExtension: true,
            lowerCase: true,
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(config, fs.readFileSync(path.resolve(__dirname, 'expected/expected-extension.js'), 'utf-8'));

            done();
        });
    });

    it('should create config file with base', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'modal')],
            base: path.resolve(__dirname, 'modal/config-base.js'),
            config: '__CONFIG__',
            filePattern: '**/*.js',
            ignorePath: false,
            keepExtension: true,
            lowerCase: true,
            moduleRoot: path.resolve(__dirname, 'modal'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(config, fs.readFileSync(path.resolve(__dirname, 'expected/expected-with-base.js'), 'utf-8'));

            done();
        });
    });
});