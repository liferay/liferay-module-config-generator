'use strict';

var assert = require('assert');
var ConfigGenerator = require('../lib/config-generator');
var fs = require('fs');
var path = require('path');

describe('ConfigGenerator', function () {
    it('should create config file for module without base config file', function (done) {
        var configGenerator = new ConfigGenerator({
            args: [path.resolve(__dirname, 'fixture')],
            config: '__CONFIG__',
            filePattern: '**/*.js',
            ignorePath: false,
            moduleConfig: 'bower.json',
            moduleRoot: path.resolve(__dirname, 'fixture'),
            skipFileOverride: true
        });

        configGenerator.process().then(function(config) {
            assert.strictEqual(config, fs.readFileSync(path.join(path.resolve(__dirname, 'fixture'), 'expected/expected.js'), 'utf-8'));

            done();
        });
    });
});