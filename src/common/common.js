'use strict';

(function() {
    var root = this;
    root.LETTERS = { LOWER: 2, CAMEL: 3, NATURAL: 4, PROPER: 5, UPPER: 6 };
    root.VISIBILITIES = { HIDDEN: 1, VISIBLE: 2, ALL: 3 };

    /**
     * Faster array filtration based on predicate function.
     * @function external:Array#filter
     * @param {Array} source The source array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @return {Array} Returns the new filtered array.
     * @example
     * var filtered = Array.filter([1,2,3,4,5], function(item, index) { return item === 5 });
     */
    Array.filter = function(source, predicate) {
        source = source || [];
        var index = -1;
        var length = source.length;
        var target = [];
        var targetIndex = -1;

        while (++index < length) {
            var item = source[index];
            if (predicate(item, index, source)) {
                target[++targetIndex] = item;
            }
        }

        return target;
    };

    /**
     * Extends an object with zero or more source objects.
     * @function external:Object#extend
     * @param {...*} [arguments=null] Zero or more source objects.
     * @return {Object} Returns the extended object.
     * @example
     * var extended = Object.extend({ key: 'value' }, anotherObject, { hi: 'dood' });
     */
    Object.extend = function() {
        var key, source;
        var target = {};

        for (var i = 0; i < arguments.length; i++) {
            source = arguments[i];

            for (key in source) {
                target[key] = source[key];
            }
        }

        return target;
    };

    if (typeof(String.prototype.trim) !== 'function') {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    root.common = {
        defaults: function(value, defaultValue) {
            return (this.isEffective(value)) ? value : defaultValue;
        },
        fetch: function(input) {
            input = input || {};
            input.items = input.items || {};

            return $.Deferred(function(defer) {
                if (!input.items[input.key]) {
                    $.ajax({
                        dataType: input.type,
                        error: function(xhr, status, error) {
                            if ($.isFunction(input.error)) {
                                input.error.call(this, defer, input.key, xhr, status, error);
                            }
                        },
                        success: function(data, status, xhr) {
                            if ($.isFunction(input.success)) {
                                input.success.call(this, defer, input.key, data, status, xhr);
                            }
                        },
                        url: input.url
                    });
                }
                else {
                    defer.resolve(input.items[input.key]);
                }
            }).promise();
        },
        getDefaultValue: function(configKey, defaultValue) {
            var env = (typeof(process) !== 'undefined' && process.env) ? process.env : null;
            var prefix = 'npm_package_config_';
            return (env && env[prefix + configKey]) ?
                this.defaults(env[prefix + configKey], defaultValue) : defaultValue;
        },
        getStorage: function() {
            var this_ = this;

            return $.Deferred(function(defer) {
                var index = -1;
                var promises = [];
                var storage = {};

                chrome.storage.local.get(null, function(items) {
                    storage = items || {};
                    storage.model = storage.model || {
                        name: '',
                        target: ''
                    };
                    storage.target = storage.target || 'java';
                    storage.targets = storage.targets || {
                        cs: { label: 'C#' },
                        java: { label: 'Java' },
                        robot: { label: 'Robot Framework' }
			
                    };

                    // first timer
                    if (!storage.timestamp) {
                        for (var key in storage.targets) {
                            var target = storage.targets[key];

                            if (!target.config) {
                                // faster array push
                                promises[++index] = this_.fetch({
                                    error: function(innerDefer, key, xhr, status, error) {
                                        console.log('error.config', key, xhr, status, error);
                                        innerDefer.reject({});
                                    },
                                    key: key,
                                    items: {},
                                    success: function(innerDefer, key, data, status, xhr) {
                                        storage.targets[key].config = this_.setDefaultValues(data);
                                        innerDefer.resolve(storage.targets[key].config);
                                    },
                                    type: 'json',
                                    url: 'assets/configs/' + key + '.json'
                                });
                            }

                            if (!target.template) {
                                // faster array push
                                promises[++index] = this_.fetch({
                                    error: function(innerDefer, key, xhr, status, error) {
                                        console.log('error.template', key, xhr, status, error);
                                        innerDefer.reject('');
                                    },
                                    key: key,
                                    items: {},
                                    success: function(innerDefer, key, data, status, xhr) {
                                        storage.targets[key].template = data;
                                        innerDefer.resolve(storage.targets[key].template);
                                    },
                                    type: 'text',
                                    url: 'assets/templates/' + key + '.handlebars'
                                });
                            }
                        }

                        promises = $.map(promises, function(promise) {
                            var innerDefer = $.Deferred();
                            promise.always(innerDefer.resolve);
                            return innerDefer.promise();
                        });
                    }
                    else {
                        // faster array push
                        promises[++index] = $.Deferred(function(innerDefer) {
                            innerDefer.resolve();
                        }).promise();
                    }

                    $.when.apply($, promises).always(function() {
                        defer.resolve(storage);
                    });
                });
            }).promise();
        },
        isEffective: function(input) {
            return (typeof(input) !== 'undefined' && input !== null);
        },
        setDefaultValues: function(input) {
            input = input || {};
            // attributes
            input.attributes = input.attributes || {};
            input.attributes.letter = input.attributes.letter ||
                this.getDefaultValue('attributes_letter', root.LETTERS.CAMEL);
            input.attributes.indent = !!input.attributes.indent;
            if (!input.attributes.indent) {
                input.attributes.indent = !!this.getDefaultValue('attributes_indent', false);
            }
            input.attributes.separator = this.defaults(input.attributes.separator,
                this.getDefaultValue('attributes_separator', '\n'));

            // copyright
            input.copyright = input.copyright || {};
            input.copyright.claimant = input.copyright.claimant ||
                this.getDefaultValue('copyright_claimant', '');
            input.copyright.year = input.copyright.year ||
                this.getDefaultValue('copyright_year', new Date().getFullYear());

            // fill
            input.fill = input.fill || {};
            input.fill.separator = input.fill.separator ||
                this.getDefaultValue('fill_separator', '');

            // model
            input.model = input.model || {};
            input.model.include = !!input.model.include;
            if (!input.model.include) {
                input.model.include = !!this.getDefaultValue('model_include', false);
            }
            input.model.name = input.model.name || this.getDefaultValue('model_name', '');
            input.model.namespace = input.model.namespace ||
                this.getDefaultValue('model_namespace', '');
            input.model.target = input.model.target || this.getDefaultValue('model_target', '');

            // nodes
            input.nodes = input.nodes || {};
            // using test framework with AngularJS locators support
            input.nodes.angular = !!input.nodes.angular;
            if (!input.nodes.angular) {
                input.nodes.angular = !!this.getDefaultValue('nodes_angular', false);
            }
            input.nodes.root = input.nodes.root || this.getDefaultValue('nodes_root', 'body');
            input.nodes.selector = input.nodes.selector ||
                this.getDefaultValue('nodes_selector', 'a,button,input,select,textarea');
            input.nodes.visibility = input.nodes.visiblity ||
                this.getDefaultValue('nodes_visibility', root.VISIBILITIES.ALL);

            // operations
            input.operations = input.operations || {};
            input.operations.extras = input.operations.extras || {};

            // operations.extras
            input.operations.extras.fill = this.defaults(input.operations.extras.fill,
                this.getDefaultValue('extras_fill', 1));
            input.operations.extras['fill.submit'] =
                this.defaults(input.operations.extras['fill.submit'],
                this.getDefaultValue('extras_fill_submit', 1));
            input.operations.extras.submit =
                this.defaults(input.operations.extras.submit,
                this.getDefaultValue('extras_submit', 1));
            input.operations.extras['verify.loaded'] =
                this.defaults(input.operations.extras['verify.loaded'],
                this.getDefaultValue('extras_verify_loaded', 1));
            input.operations.extras['verify.url'] =
                this.defaults(input.operations.extras['verify.url'],
                this.getDefaultValue('extras_verify_url', 1));

            input.operations.letter = input.operations.letter ||
                this.getDefaultValue('operations_letter', root.LETTERS.CAMEL);
            input.operations.separator = this.defaults(input.operations.separator,
                this.getDefaultValue('operations_separator', '\n'));

            input.timeout = input.timeout || this.getDefaultValue('timeout', 15);

            return input;
        }
    };

    if (typeof(exports) !== 'undefined') {
        if (typeof(module) !== 'undefined' && module.exports) {
            exports = module.exports = root;
        }
        exports.common = root.common;
        exports.LETTERS = root.LETTERS;
        exports.VISIBILITIES = root.VISIBILITIES;
    }
}).call(this);
