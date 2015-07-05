var LETTERS = { LOWER: 2, CAMEL: 3, NATURAL: 4, PROPER: 5, UPPER: 6 };
var VISIBILITIES = { HIDDEN: 1, VISIBLE: 2, ALL: 3 };

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

var common = {
    defaults: function(value, defaultValue) {
        return (this.isEffective(value)) ? value : defaultValue;
    },
    fetch: function(input) {
        input = input || {};

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
    getStorage: function() {
        var this_ = this;

        return $.Deferred(function(defer) {
            var index = -1;
            var promises = [];
            var storage = {};

            chrome.storage.local.get(null, function(items) {
                storage = items;
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
                    defer.resolve(storage)
                });
            });
        }).promise();
    },
    isEffective: function(input) {
        return (typeof(input) !== 'undefined' && input !== null);
    },
    setDefaultValues: function(input) {
        // attributes
        input.attributes = input.attributes || {};
        input.attributes.letter = input.attributes.letter || LETTERS.CAMEL;
        input.attributes.indent = !!input.attributes.indent;
        input.attributes.separator = this.defaults(input.attributes.separator, '\n');

        // copyright
        input.copyright = input.copyright || {};
        input.copyright.claimant = input.copyright.claimant || '';
        input.copyright.year = input.copyright.year || new Date().getFullYear();

        // fill
        input.fill = input.fill || {};
        input.fill.separator = input.fill.separator || '';

        // model
        input.model = input.model || {};
        input.model.include = !!input.model.include;
        input.model.name = input.model.name || '';
        input.model.namespace = input.model.namespace || '';
        input.model.target = input.model.target || '';

        // nodes
        input.nodes = input.nodes || {};
        // using test framework with AngularJS locators support
        input.nodes.angular = !!input.nodes.angular;
        input.nodes.root = input.nodes.root || 'body';
        input.nodes.selector = input.nodes.selector || 'a,button,input,select,textarea';
        input.nodes.visibility = input.nodes.visiblity || VISIBILITIES.ALL;

        // operations
        input.operations = input.operations || {};
        input.operations.extras = input.operations.extras || {};

        // operations.extras
        input.operations.extras.fill = this.defaults(input.operations.extras.fill, 1);
        input.operations.extras['fill.submit'] = this.defaults(input.operations.extras['fill.submit'], 1);
        input.operations.extras.submit = this.defaults(input.operations.extras.submit, 1);
        input.operations.extras['verify.loaded'] = this.defaults(input.operations.extras['verify.loaded'], 1);
        input.operations.extras['verify.url'] = this.defaults(input.operations.extras['verify.url'], 1);

        input.operations.letter = input.operations.letter || LETTERS.CAMEL;
        input.operations.separator = this.defaults(input.operations.separator, '\n');

        input.timeout = input.timeout || 15;

        return input;
    }
};
