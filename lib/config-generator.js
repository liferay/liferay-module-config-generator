'use strict';

var beautify = require('js-beautify').js_beautify;
var esprima = require('esprima-fb');
var fs = require('fs');
var jsstana = require('jsstana');
var minimatch = require('minimatch');
var path = require('path');
var Promise = require('bluebird');
var recast = require('recast');
var walk = require('walk');

Promise.promisifyAll(fs);

var builders = recast.types.builders;

/**
 * ConfigGeneraror implementation
 * @class ConfigGeneraror
 * @param {Object} options Configuration options
 */
function ConfigGeneraror(options) {
    var instance = this;

    instance._options = options;
}

ConfigGeneraror.prototype = {
    constructor: ConfigGeneraror,

    /**
     * Processes the passed files or folders and generates config file.
     *
     * @method process
     * @return {Promise} Returns Promise which will be resolved with the generated config file.
     */
    process: function() {
        var instance = this;

        instance._modules = [];

        return new Promise(function(resolve, reject) {
            var base;
            var processors = [];

            if (instance._options.base) {
                base = fs.readFileSync(path.resolve(instance._options.base), 'utf8');
            }

            // For every file or folder, create a promise,
            // parse the file, extract the config and store it
            // to the global modules array.
            // Once all files are being processed, store the generated config.
            for (var i = 0; i < instance._options.args.length; i++) {
                var file = instance._options.args[i];

                var fileStats = fs.statSync(file);

                if (fileStats.isDirectory(file)) {
                    var walker = walk.walk(file, {
                        followLinks: false
                    });

                    walker.on('file', instance._onWalkerFile.bind(instance));

                    processors.push(instance._onWalkerEnd(walker));
                } else if(fileStats.isFile()) {
                    processors.push(instance._processFile(file));
                }
            }

            Promise.all(processors)
                .then(function(uselessPromises) {
                    return instance._generateConfig();
                })
                .then(function(config) {
                    var content;

                    if (base) {
                        content = base + instance._options.config + '.modules = ' + JSON.stringify(config) + ';';
                    } else {
                        content = 'var ' + instance._options.config + ' = {modules: ' + JSON.stringify(config) + '};';
                    }

                    return instance._saveConfig(beautify(content));
                })
                .then(function(config) {
                    resolve(config);
                })
                .catch(function(error) {
                    reject(error);
                });
        });
    },

    /**
     * Extracts conditions from a module configuration.
     *
     * @method _extractCondition
     * @protected
     * @param {Object} ast AST to be processed
     * @return {Object} The extracted values for the conditional options
     */
    _extractCondition: function(ast) {
        var instance = this;

        var found;
        var meta = ast;
        var values = {};

        jsstana.traverse(ast, function (node) {
            if (!found) {
                var match = jsstana.match('(ident META)', node);

                if (match) {
                    jsstana.traverse(meta, function (node) {
                        if (!found) {
                            match = jsstana.match('(return)', node);

                            if (match) {
                                values = instance._extractObjectValues(['path', 'fullPath', 'condition', 'group'], node);

                                found = true;
                            }
                        }
                    });

                } else {
                    meta = node;
                }
            }
        });

        return values;
    },

    /**
     * Extract values for some idents (look in jsstana documentation) from an AST
     *
     * @method _extractObjectValues
     * @param {Arrat} idents The idents which values should be looked in the AST
     * @param {AST} ast The AST to be processed.
     * @return {Object} An object with the extracted values for all found idents
     */
    _extractObjectValues: function(idents, ast) {
        var instance = this;

        var result = Object.create(null);
        var found;
        var ident;

        if (ast) {
            jsstana.traverse(ast, function (node) {
                if (found) {
                    found = false;

                    result[ident] = instance._extractValue(node);
                }

                for (var i = 0; i < idents.length; i++) {
                    ident = idents[i];

                    if (jsstana.match('(ident ' + ident + ')', node)) {
                        found = true;

                        break;
                    }
                }
            });
        }

        return result;
    },

    /**
     * Extracts the value from a jsstana node. The value may be
     * Literal, ObjectExpression, ArrayExpression or FunctionExpression.
     *
     * @method _extractValue
     * @protected
     * @param {Object} node jsstana node which should be processed
     * @return {String} The extracted value from the node
     */
    _extractValue: function(node) {
        var instance = this;

        var i;

        if (node.type === 'Literal') {
            return node.value;
        } else if (node.type === 'ObjectExpression') {
            var obj = {};

            for (i = 0; i < node.properties.length; i++) {
                var property = node.properties[i];

                obj[property.key.name] = instance._extractValue(property.value);
            }

            return obj;
        } else if (node.type === 'ArrayExpression') {
            var arr = [];

            for (i = 0; i < node.elements.length; i++) {
                arr.push(instance._extractValue(node.elements[i]));
            }

            return arr;

        } else if (node.type === 'FunctionExpression') {
            return recast.print(node).code;
        }
    },

    /**
     * Generates a config object from all found modules
     *
     * @method _generateConfig
     * @protected
     * @return {Promise} Returns Promise which will be resolved with the generated configuration.
     */
    _generateConfig: function() {
        var instance = this;

        return new Promise(function(resolve, reject) {
            var config = {};

            for (var i = 0; i < instance._modules.length; i++) {
                var module = instance._modules[i];

                var storedModule = config[module.name] = {
                    dependencies: module.dependencies
                };

                if (module.condition) {
                    storedModule.condition = module.condition;
                }

                if (!instance._options.ignorePath) {
                    if (module.fullPath) {
                        storedModule.fullPath = module.fullPath;
                    }
                    else {
                        var dirname = path.dirname(module.name);

                        var modulePath = module.path || (dirname !== '.' ? dirname + '/' + module.file : module.file);

                        storedModule.path = modulePath;
                    }
                }
            }

            resolve(config);
        });
    },

    /**
     * Generates a module name in case it is not present in the AMD definition.
     *
     * @method _generateModuleName
     * @protected
     * @param {String} file The file path to be processed and module name to be generated.
     * @return {String} The generated module name
     */
    _generateModuleName: function(file) {
        var instance = this;

        var ext;

        if (!instance._options.keepExtension) {
            ext = instance._options.extension || path.extname(file);
        }

        var filePath = file;

        var relativeDir = path.normalize(instance._options.moduleRoot);

        var relativeDirIndex = filePath.indexOf(relativeDir);

        if (relativeDirIndex === 0) {
            filePath = filePath.substring(relativeDir.length);
        }

        var fileName = path.basename(filePath, ext);

        if (instance._options.format) {
            var formatRegex = instance._options.format[0].split('/');
            formatRegex = new RegExp(formatRegex[1], formatRegex[2]);

            var replaceValue = instance._options.format[1];

            fileName = fileName.replace(formatRegex, replaceValue);
        }

        var moduleConfig = {};

        var moduleConfigFile = path.join(instance._options.moduleRoot, instance._options.moduleConfig);

        if (fs.existsSync(moduleConfigFile)) {
            moduleConfig = require(moduleConfigFile);
        }

        var moduleName = path.join(moduleConfig.name, path.dirname(filePath), fileName);

        if (instance._options.lowerCase) {
            moduleName = moduleName.toLowerCase();
        }

        return moduleName;
    },

    /**
     * Retrieves the generated configuration for all found modules
     *
     * @method _getConfig
     * @protected
     * @param {String} file The file which should be processed
     * @param {Object} ast  The parsed AST of the file, which should be processed.
     * @return {Promise} Returns Promise which will be resolved with the generated configuration.
     */
    _getConfig: function(file, ast) {
        var instance = this;

        return new Promise(function(resolve, reject) {
            var result = [];

            jsstana.traverse(ast, function (node) {
                var match = jsstana.match('(or (call define ? ?) (call define ? ? ?))', node);

                if (match) {
                    var dependencies;
                    var moduleName;

                    // If the module does not have an module id, generate it.
                    if (node.arguments.length === 2) {
                        moduleName = instance._generateModuleName(file);
                        dependencies = node.arguments[0];

                        // Add the module name.
                        node.arguments.unshift(builders.literal(moduleName));

                        // Save the file back
                        if (!instance._options.skipFileOverride) {
                            fs.writeFileSync(file, recast.prettyPrint(ast, {wrapColumn: 1024}).code);
                        }
                    } else {
                        moduleName = node.arguments[0].value;
                        dependencies = node.arguments[1];
                    }

                    var config = {
                        file: path.basename(file),
                        name: moduleName,
                        dependencies: instance._extractValue(dependencies)
                    };

                    var values = instance._extractCondition(node);

                    Object.keys(values || {}).forEach(function(key) {
                        config[key] = values[key];
                    });

                    result.push(config);
                }
            });

            resolve(result);
        });
    },

    /**
     * Parses the content of a file
     *
     * @method _parseFile
     * @protected
     * @param {String} file The file which should be parsed
     * @param {String} content The content of the file which should be parsed
     * @return {Promise} Returns Promise which will be resolved with file's AST.
     */
    _parseFile: function(file, content) {
        var instance = this;

        return new Promise(function(resolve, reject) {
            var ast = esprima.parse(content);

            resolve(ast);
        });
    },

    /**
     * Processes a file and generates configuration object for all modules found inside
     *
     * @method _processFile
     * @protected
     * @param {String} file The file which should be processed
     * @return {Promise} Returns Promise which will be resolved with the generated config.
     */
    _processFile: function(file) {
        var instance = this;

        return new Promise(function(resolve) {
            fs.readFileAsync(file, 'utf-8')
                .then(function(content) {
                    return instance._parseFile(file, content);
                })
                .then(function(ast) {
                    return instance._getConfig(file, ast);
                })
                .then(function(config) {
                    instance._modules = instance._modules.concat(config);

                    resolve(config);
                });
        });
    },

    /**
     * Listener which will be invoked when a file whiting the provided folder is found
     *
     * @method _onWalkerFile
     * @protected
     * @param {String} root The root directory of the file
     * @param {Object} fileStats Object with data about the file
     * @param {Function} next A callback function to be called once the file is processed
     */
    _onWalkerFile: function(root, fileStats, next) {
        var instance = this;

        var file = path.join(root, fileStats.name);

        if (minimatch(file, instance._options.filePattern, {dot: true})) {
            instance._processFile(file)
                .then(function(config) {
                    next();
                });
        }
        else {
            next();
        }
    },

    /**
     * Listener which will be invoked once the walker processes all files in the provided directory.
     *
     * @method _onWalkerEnd
     * @param {Object} walker The walker object
     * @return {Promise} Returns Promise which will be resolved with the root folder, file data and a "next" callback
     */
    _onWalkerEnd: function(walker){
        var instance = this;

        return new Promise(function(resolve, reject) {
            walker.on('end', resolve);
        });
    },

    /**
     * Saves the generated configuration file on the hard drive
     *
     * @method _saveConfig
     * @protected
     * @param {Object} config The configuration object to be saved
     * @return {Promise} Returns Promise which will be resolved with the generated config file
     */
    _saveConfig: function(config) {
        var instance = this;

        return new Promise(function(resolve, reject) {
            if (instance._options.output) {
                fs.writeFileAsync(instance._options.output, config)
                    .then(function() {
                        resolve(config);
                    });
            } else {
                resolve(config);
            }
        });
    }
};

module.exports = ConfigGeneraror;