/* jslint node: true */
/* global describe, it, expect */

'use strict';

GLOBAL.window = GLOBAL;
String.prototype.trim = null;
require(__dirname + '/../../src/chrome/assets/js/common.js');

window.$ = {
    ajax: function(options) {
        return options;
    },
    Deferred: function(handler) {
        var result = { always: function() {}, done: function() {}, fail: function() {} };
        var defer = {
            promise: function() {
                return {
                    always: function(alwaysHandler) {
                        if (window.$.isFunction(alwaysHandler)) {
                            alwaysHandler.apply(this, result.always);
                        }
                    },
                    done: function(doneHandler) {
                        if (window.$.isFunction(doneHandler)) {
                            doneHandler.apply(this, result.done);
                        }
                    },
                    fail: function(failHandler) {
                        if (window.$.isFunction(failHandler)) {
                            failHandler.apply(this, result.fail);
                        }
                    }
                };
            },
            reject: function() {
                result.fail = arguments;
                return arguments;
            },
            resolve: function() {
                result.done = arguments;
                return arguments;
            }
        };
        if (window.$.isFunction(handler)) {
            handler(defer);
        }
        return defer;
    },
    isFunction: function(func) {
        return typeof(func) === 'function';
    },
    map: function(array, handler) {
        return array.map(handler);
    },
    when: {
        apply: function(namespace, array) {
            return {
                always: function(func) { func(); }
            };
        }
    }
};

window.chrome = {
    storage: {
        local: {
            get: function(defaults, handler) {}
        }
    }
};

describe('Array.filter', function() {
    it('should return expected array from number array items', function() {
        expect(Array.filter([1,2,3,4,5], function(item) { return item === 3 })).toEqual([3]);
    });

    it('should return expected array from string array items', function() {
        expect(Array.filter(['a','b','b',null,'c'], function(item) { return item === 'b' })).
            toEqual(['b','b']);
    });

    it('should return expected array from undefined and null array items', function() {
        expect(Array.filter([null,undefined,null,null], function(item) { return item === null })).
            toEqual([null,null,null]);
    });

    it('should return expected array from hash array items', function() {
        expect(Array.filter([{'key':'a'},{'key':1},undefined,{'key':'a'}],
            function(item) { return (item||{}).key === 'a' })).
            toEqual([{'key':'a'},{'key':'a'}]);
    });

    it('should return expected array from splitted string source', function() {
        expect(Array.filter('aba', function(item) { return item === 'a' })).toEqual(['a','a']);
    });

    it('should return empty array on undefined source', function() {
        expect(Array.filter(undefined, function(item) { return item === 'a' })).toEqual([]);
    });

    it('should return empty array on null source', function() {
        expect(Array.filter(null, function(item) { return item === 'a' })).toEqual([]);
    });

    it('should return empty array on number source', function() {
        expect(Array.filter(1, function(item) { return item === 'a' })).toEqual([]);
    });

    it('should return empty array on empty hash source', function() {
        expect(Array.filter({}, function(item) { return item === 'a' })).toEqual([]);
    });

    it('should return empty array on non-empty hash source', function() {
        expect(Array.filter({'0':'a'}, function(item) { return item === 'a' })).toEqual([]);
    });
});

describe('Object.extend', function() {
    it('should return extended hash from non-empty single hash', function() {
        expect(Object.extend({'0':'a'})).toEqual({'0':'a'});
    });

    it('should return extended hash from non-empty multi hash', function() {
        expect(Object.extend({'0':'a'},{'1':'b'})).toEqual({'0':'a','1':'b'});
    });

    it('should return extended hash from overlap multi hash', function() {
        expect(Object.extend({'1':'a'},{'1':'b'})).toEqual({'1':'b'});
    });

    it('should return extended hash from mixed multi hash', function() {
        expect(Object.extend({'0':'a'},{},undefined,null,1,{'1':'b'},['x','y'])).
            toEqual({'0':'x','1':'y'});
    });

    it('should return empty hash from undefined source', function() {
        expect(Object.extend(undefined)).toEqual({});
    });

    it('should return empty hash from null source', function() {
        expect(Object.extend(null)).toEqual({});
    });

    it('should return empty hash from number source', function() {
        expect(Object.extend(1)).toEqual({});
    });

    it('should return empty hash from empty array source', function() {
        expect(Object.extend([])).toEqual({});
    });

    it('should return hash from non-empty array source', function() {
        expect(Object.extend(['0','a'])).toEqual({0:'0', 1:'a'});
    });

    it('should return empty hash from empty hash', function() {
        expect(Object.extend({})).toEqual({});
    });
});

describe('String.trim (polyfill)', function() {
    it('should return left trimmed string', function() {
        expect('       left spaces string'.trim()).toEqual('left spaces string');
    });

    it('should return right trimmed string', function() {
        expect('right spaces string         '.trim()).toEqual('right spaces string');
    });

    it('should return both trimmed string', function() {
        expect('        both spaces string          '.trim()).toEqual('both spaces string');
    });

    it('should return untrimmed spaces in the middle of string', function() {
        expect('untrimmed          string'.trim()).toEqual('untrimmed          string');
    });
});

describe('common.defaults', function() {
    it('should return default value on undefined value', function() {
        expect(common.defaults(undefined,'yes')).toEqual('yes');
    });

    it('should return default value on null value', function() {
        expect(common.defaults(null,'yes')).toEqual('yes');
    });

    it('should return value on zero value', function() {
        expect(common.defaults(0,'yes')).toEqual(0);
    });

    it('should return value on number value', function() {
        expect(common.defaults(1,'yes')).toEqual(1);
    });

    it('should return value on string value', function() {
        expect(common.defaults('no','yes')).toEqual('no');
    });

    it('should return value on array value', function() {
        expect(common.defaults([0],'yes')).toEqual([0]);
    });

    it('should return value on hash value', function() {
        expect(common.defaults({'0':'1'},'yes')).toEqual({'0':'1'});
    });

    it('should return undefined on undefined default value', function() {
        expect(common.defaults()).toBeUndefined();
    });

    it('should return null on null default value', function() {
        expect(common.defaults(undefined,null)).toBeNull();
    });

    it('should return zero on zero default value', function() {
        expect(common.defaults(undefined,0)).toEqual(0);
    });

    it('should return number on number default value', function() {
        expect(common.defaults(undefined,1)).toEqual(1);
    });

    it('should return string on string default value', function() {
        expect(common.defaults(undefined,'yes')).toEqual('yes');
    });

    it('should return array on array default value', function() {
        expect(common.defaults(undefined,[0])).toEqual([0]);
    });

    it('should return hash on hash default value', function() {
        expect(common.defaults(undefined,{'0':1})).toEqual({'0':1});
    });
});

describe('common.fetch', function() {
    it('should return promise object', function() {
        var deferred = spyOn(window.$, 'Deferred').and.callThrough();
        var response = common.fetch();
        expect(deferred).toHaveBeenCalled();
        expect(deferred.calls.count()).toEqual(1);
        expect(typeof(response.done)).toEqual('function');
        expect(typeof(response.fail)).toEqual('function');
    });

    it('should return success from promise object', function() {
        var ajax = spyOn(window.$, 'ajax').and.callFake(function(options) {
            options.success({ a: 'value' }, 200, { xhr: 1 });
        });
        var deferred = spyOn(window.$, 'Deferred').and.callThrough();
        var response = common.fetch({ items: {}, key:'a',
                success: function(defer, key, data, status, xhr) {
            expect(typeof(defer.reject)).toEqual('function');
            expect(typeof(defer.resolve)).toEqual('function');
            expect(key).toEqual('a');
            expect(data).toEqual({ a: 'value' });
            expect(status).toEqual(200);
            expect(xhr).toEqual({ xhr: 1 });
            defer.resolve('value');
        } });
        expect(deferred).toHaveBeenCalled();
        expect(deferred.calls.count()).toEqual(1);
        expect(ajax).toHaveBeenCalled();
        expect(ajax.calls.count()).toEqual(1);
        expect(typeof(response.done)).toEqual('function');
        expect(typeof(response.fail)).toEqual('function');
        response.done(function(data) {
            expect(data).toEqual('value');
        });
    });

    it('should return error from promise object', function() {
        var ajax = spyOn(window.$, 'ajax').and.callFake(function(options) {
            options.error({ xhr: 1 }, 404, { error: 'Not found' });
        });
        var deferred = spyOn(window.$, 'Deferred').and.callThrough();
        var response = common.fetch({ items: {}, key:'a',
                error: function(defer, key, xhr, status, error) {
            expect(typeof(defer.reject)).toEqual('function');
            expect(typeof(defer.resolve)).toEqual('function');
            expect(key).toEqual('a');
            expect(xhr).toEqual({ xhr: 1 });
            expect(status).toEqual(404);
            expect(error).toEqual({ error: 'Not found' });
            defer.reject('eeep...');
        } });
        expect(deferred).toHaveBeenCalled();
        expect(deferred.calls.count()).toEqual(1);
        expect(ajax).toHaveBeenCalled();
        expect(ajax.calls.count()).toEqual(1);
        expect(typeof(response.done)).toEqual('function');
        expect(typeof(response.fail)).toEqual('function');
        response.fail(function(error) {
            expect(error).toEqual('eeep...');
        });
    });

    it('should return success from cache', function() {
        var deferred = spyOn(window.$, 'Deferred').and.callThrough();
        var response = common.fetch({ items: { a: 'value' }, key:'a' });
        expect(deferred).toHaveBeenCalled();
        expect(deferred.calls.count()).toEqual(1);
        expect(typeof(response.done)).toEqual('function');
        expect(typeof(response.fail)).toEqual('function');
        response.done(function(data) {
            expect(data).toEqual('value');
        });
    });

    it('should ignore success call on undefined success handler', function() {
        var ajax = spyOn(window.$, 'ajax').and.callFake(function(options) {
            options.success({ a: 'value' }, 200, { xhr: 1 });
        });
        var deferred = spyOn(window.$, 'Deferred').and.callThrough();
        var response = common.fetch({ items: {}, key:'a' });
        expect(deferred).toHaveBeenCalled();
        expect(deferred.calls.count()).toEqual(1);
        expect(ajax).toHaveBeenCalled();
        expect(ajax.calls.count()).toEqual(1);
        expect(typeof(response.done)).toEqual('function');
        expect(typeof(response.fail)).toEqual('function');
        response.done(function(data) {
            expect(data).toBeUndefined();
        });
    });

    it('should ignore error call on undefined error handler', function() {
        var ajax = spyOn(window.$, 'ajax').and.callFake(function(options) {
            options.error({ xhr: 1 }, 404, { error: 'Not found' });
        });
        var deferred = spyOn(window.$, 'Deferred').and.callThrough();
        var response = common.fetch({ items: {}, key:'a' });
        expect(deferred).toHaveBeenCalled();
        expect(deferred.calls.count()).toEqual(1);
        expect(ajax).toHaveBeenCalled();
        expect(ajax.calls.count()).toEqual(1);
        expect(typeof(response.done)).toEqual('function');
        expect(typeof(response.fail)).toEqual('function');
        response.fail(function(error) {
            expect(error).toBeUndefined();
        });
    });
});

describe('common.getStorage', function() {
    it('should return promise object', function() {
        var deferred = spyOn(window.$, 'Deferred').and.callThrough();
        var response = common.getStorage();
        expect(deferred).toHaveBeenCalled();
        expect(deferred.calls.count()).toEqual(1);
        expect(typeof(response.done)).toEqual('function');
        expect(typeof(response.fail)).toEqual('function');
    });

    it('should return storage on first time call', function() {
        var ajax = spyOn(window.$, 'ajax').and.callFake(function(options) {
            if (options.url.indexOf('/configs/') > -1) {
                options.success({}, 200, { xhr: 1 });
            } else if (options.url.indexOf('/templates/') > -1) {
                options.success('{{template}}', 200, { xhr: 1 });
            }
        });
        var deferred = spyOn(window.$, 'Deferred').and.callThrough();
        var get = spyOn(window.chrome.storage.local, 'get').and.callFake(function(defaults, handler) {
            handler();
        });
        var response = common.getStorage();
        expect(ajax).toHaveBeenCalled();
        // 3 targets * 2 calls
        expect(ajax.calls.count()).toEqual(6);
        expect(deferred).toHaveBeenCalled();
        // 1 main, 3 targets * 2 calls + 6 wrappers.
        expect(deferred.calls.count()).toEqual(13);
        expect(get).toHaveBeenCalled();
        expect(get.calls.count()).toEqual(1);
        expect(typeof(response.done)).toEqual('function');
        expect(typeof(response.fail)).toEqual('function');
        response.done(function(data) {
            var values = common.setDefaultValues();
            expect(data).toEqual({
                model: { name: '', target: '' },
                target: 'java',
                targets: {
                    cs: { label: 'C#', config: values, template: '{{template}}' },
                    java: { label: 'Java', config: values, template: '{{template}}' },
                    robot: { label: 'Robot Framework', config: values, template: '{{template}}' }
                }
            });
        });
    });

    it('should return storage on first time call with existing configs', function() {
        var ajax = spyOn(window.$, 'ajax').and.callFake(function(options) {
            if (options.url.indexOf('/configs/') > -1) {
                options.success({}, 200, { xhr: 1 });
            } else if (options.url.indexOf('/templates/') > -1) {
                options.success('{{template}}', 200, { xhr: 1 });
            }
        });
        var deferred = spyOn(window.$, 'Deferred').and.callThrough();
        var get = spyOn(window.chrome.storage.local, 'get').and.callFake(function(defaults, handler) {
            handler({ targets: {
                cs: { config: { timeout: 90 }, label: 'C#' },
                java: { config: { timeout: 90 }, label: 'Java' },
                robot: { config: { timeout: 90 }, label: 'Robot Framework' }
            } });
        });
        var response = common.getStorage();
        expect(ajax).toHaveBeenCalled();
        // 3 targets * 1 calls
        expect(ajax.calls.count()).toEqual(3);
        expect(deferred).toHaveBeenCalled();
        // 1 main, 3 targets * 1 calls + 3 wrappers.
        expect(deferred.calls.count()).toEqual(7);
        expect(get).toHaveBeenCalled();
        expect(get.calls.count()).toEqual(1);
        expect(typeof(response.done)).toEqual('function');
        expect(typeof(response.fail)).toEqual('function');
        response.done(function(data) {
            var values = { timeout: 90 };
            expect(data).toEqual({
                model: { name: '', target: '' },
                target: 'java',
                targets: {
                    cs: { label: 'C#', config: values, template: '{{template}}' },
                    java: { label: 'Java', config: values, template: '{{template}}' },
                    robot: { label: 'Robot Framework', config: values, template: '{{template}}' }
                }
            });
        });
    });

    it('should return storage on first time call with existing templates', function() {
        var ajax = spyOn(window.$, 'ajax').and.callFake(function(options) {
            if (options.url.indexOf('/configs/') > -1) {
                options.success({}, 200, { xhr: 1 });
            } else if (options.url.indexOf('/templates/') > -1) {
                options.success('{{template}}', 200, { xhr: 1 });
            }
        });
        var deferred = spyOn(window.$, 'Deferred').and.callThrough();
        var get = spyOn(window.chrome.storage.local, 'get').and.callFake(function(defaults, handler) {
            handler({ targets: {
                cs: { label: 'C#', template: '{{cached}}' },
                java: { label: 'Java', template: '{{cached}}' },
                robot: { label: 'Robot Framework', template: '{{cached}}' }
            } });
        });
        var response = common.getStorage();
        expect(ajax).toHaveBeenCalled();
        // 3 targets * 1 calls
        expect(ajax.calls.count()).toEqual(3);
        expect(deferred).toHaveBeenCalled();
        // 1 main, 3 targets * 1 calls + 3 wrappers.
        expect(deferred.calls.count()).toEqual(7);
        expect(get).toHaveBeenCalled();
        expect(get.calls.count()).toEqual(1);
        expect(typeof(response.done)).toEqual('function');
        expect(typeof(response.fail)).toEqual('function');
        response.done(function(data) {
            var values = common.setDefaultValues();
            expect(data).toEqual({
                model: { name: '', target: '' },
                target: 'java',
                targets: {
                    cs: { label: 'C#', config: values, template: '{{cached}}' },
                    java: { label: 'Java', config: values, template: '{{cached}}' },
                    robot: { label: 'Robot Framework', config: values, template: '{{cached}}' }
                }
            });
        });
    });

    it('should return storage on consecutive call', function() {
        var ajax = spyOn(window.$, 'ajax').and.callFake(function(options) {
            if (options.url.indexOf('/configs/') > -1) {
                options.success({}, 200, { xhr: 1 });
            } else if (options.url.indexOf('/templates/') > -1) {
                options.success('{{template}}', 200, { xhr: 1 });
            }
        });
        var deferred = spyOn(window.$, 'Deferred').and.callThrough();
        var get = spyOn(window.chrome.storage.local, 'get').and.callFake(function(defaults, handler) {
            handler({ timestamp: 1 });
        });
        var response = common.getStorage();
        expect(ajax).not.toHaveBeenCalled();
        expect(ajax.calls.count()).toEqual(0);
        expect(deferred).toHaveBeenCalled();
        // 1 main, 1 wrapper.
        expect(deferred.calls.count()).toEqual(2);
        expect(get).toHaveBeenCalled();
        expect(get.calls.count()).toEqual(1);
        expect(typeof(response.done)).toEqual('function');
        expect(typeof(response.fail)).toEqual('function');
        response.done(function(data) {
            expect(data).toEqual({
                timestamp: 1,
                model: { name: '', target: '' },
                target: 'java',
                targets: {
                    cs: { label: 'C#' },
                    java: { label: 'Java' },
                    robot: { label: 'Robot Framework' }
                }
            });
        });
    });

    it('should return error on first time call with config error', function() {
        var ajax = spyOn(window.$, 'ajax').and.callFake(function(options) {
            if (options.url.indexOf('/configs/') > -1) {
                options.error({ xhr: 1 }, 404, {});
            } else if (options.url.indexOf('/templates/') > -1) {
                options.success('{{template}}', 200, { xhr: 1 });
            }
        });
        var deferred = spyOn(window.$, 'Deferred').and.callThrough();
        var get = spyOn(window.chrome.storage.local, 'get').and.callFake(function(defaults, handler) {
            handler();
        });
        // silent
        var log = spyOn(window.console, 'log').and.callFake(function() {});
        var response = common.getStorage();
        expect(ajax).toHaveBeenCalled();
        // 3 targets * 2 calls
        expect(ajax.calls.count()).toEqual(6);
        expect(deferred).toHaveBeenCalled();
        // 1 main, 3 targets * 2 calls + 6 wrappers.
        expect(deferred.calls.count()).toEqual(13);
        expect(get).toHaveBeenCalled();
        expect(get.calls.count()).toEqual(1);
        expect(log).toHaveBeenCalled();
        expect(log.calls.count()).toEqual(3);
        expect(typeof(response.done)).toEqual('function');
        expect(typeof(response.fail)).toEqual('function');
        response.done(function(data) {
            expect(data).toEqual({
                model: { name: '', target: '' },
                target: 'java',
                targets: {
                    cs: { label: 'C#', template: '{{template}}' },
                    java: { label: 'Java', template: '{{template}}' },
                    robot: { label: 'Robot Framework', template: '{{template}}' }
                }
            });
        });
    });

    it('should return error on first time call with template error', function() {
        var ajax = spyOn(window.$, 'ajax').and.callFake(function(options) {
            if (options.url.indexOf('/configs/') > -1) {
                options.success({}, 200, { xhr: 1 });
            } else if (options.url.indexOf('/templates/') > -1) {
                options.error({ xhr: 1 }, 404, '');
            }
        });
        var deferred = spyOn(window.$, 'Deferred').and.callThrough();
        var get = spyOn(window.chrome.storage.local, 'get').and.callFake(function(defaults, handler) {
            handler();
        });
        // silent
        var log = spyOn(window.console, 'log').and.callFake(function() {});
        var response = common.getStorage();
        expect(ajax).toHaveBeenCalled();
        // 3 targets * 2 calls
        expect(ajax.calls.count()).toEqual(6);
        expect(deferred).toHaveBeenCalled();
        // 1 main, 3 targets * 2 calls + 6 wrappers.
        expect(deferred.calls.count()).toEqual(13);
        expect(get).toHaveBeenCalled();
        expect(get.calls.count()).toEqual(1);
        expect(log).toHaveBeenCalled();
        expect(log.calls.count()).toEqual(3);
        expect(typeof(response.done)).toEqual('function');
        expect(typeof(response.fail)).toEqual('function');
        response.done(function(data) {
            var values = common.setDefaultValues();
            expect(data).toEqual({
                model: { name: '', target: '' },
                target: 'java',
                targets: {
                    cs: { config: values, label: 'C#' },
                    java: { config: values, label: 'Java' },
                    robot: { config: values, label: 'Robot Framework' }
                }
            });
        });
    });
});

describe('common.isEffective', function() {
    it('should return false on undefined', function() {
        expect(common.isEffective()).toBeFalsy();
    });

    it('should return false on null', function() {
        expect(common.isEffective(null)).toBeFalsy();
    });

    it('should return true on zero', function() {
        expect(common.isEffective(0)).toBeTruthy();
    });

    it('should return true on number', function() {
        expect(common.isEffective(1)).toBeTruthy();
    });

    it('should return true on empty string', function() {
        expect(common.isEffective('')).toBeTruthy();
    });

    it('should return true on string', function() {
        expect(common.isEffective('a')).toBeTruthy();
    });

    it('should return true on empty array', function() {
        expect(common.isEffective([])).toBeTruthy();
    });

    it('should return true on array', function() {
        expect(common.isEffective([0])).toBeTruthy();
    });

    it('should return true on empty hash', function() {
        expect(common.isEffective({})).toBeTruthy();
    });

    it('should return true on hash', function() {
        expect(common.isEffective({ key: 'value' })).toBeTruthy();
    });
});
