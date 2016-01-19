/* jslint node: true */
/* global describe, it, expect */

'use strict';

GLOBAL.window = GLOBAL;
String.prototype.trim = null;
var common = require(__dirname + '/../../src/common/common.js');

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
        expect(common.common.defaults(undefined,'yes')).toEqual('yes');
    });

    it('should return default value on null value', function() {
        expect(common.common.defaults(null,'yes')).toEqual('yes');
    });

    it('should return value on zero value', function() {
        expect(common.common.defaults(0,'yes')).toEqual(0);
    });

    it('should return value on number value', function() {
        expect(common.common.defaults(1,'yes')).toEqual(1);
    });

    it('should return value on string value', function() {
        expect(common.common.defaults('no','yes')).toEqual('no');
    });

    it('should return value on array value', function() {
        expect(common.common.defaults([0],'yes')).toEqual([0]);
    });

    it('should return value on hash value', function() {
        expect(common.common.defaults({'0':'1'},'yes')).toEqual({'0':'1'});
    });

    it('should return undefined on undefined default value', function() {
        expect(common.common.defaults()).toBeUndefined();
    });

    it('should return null on null default value', function() {
        expect(common.common.defaults(undefined,null)).toBeNull();
    });

    it('should return zero on zero default value', function() {
        expect(common.common.defaults(undefined,0)).toEqual(0);
    });

    it('should return number on number default value', function() {
        expect(common.common.defaults(undefined,1)).toEqual(1);
    });

    it('should return string on string default value', function() {
        expect(common.common.defaults(undefined,'yes')).toEqual('yes');
    });

    it('should return array on array default value', function() {
        expect(common.common.defaults(undefined,[0])).toEqual([0]);
    });

    it('should return hash on hash default value', function() {
        expect(common.common.defaults(undefined,{'0':1})).toEqual({'0':1});
    });
});

describe('common.fetch', function() {
    it('should return promise object', function() {
        var deferred = spyOn(window.$, 'Deferred').and.callThrough();
        var response = common.common.fetch();
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
        var response = common.common.fetch({ items: {}, key:'a',
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
        var response = common.common.fetch({ items: {}, key:'a',
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
        var response = common.common.fetch({ items: { a: 'value' }, key:'a' });
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
        var response = common.common.fetch({ items: {}, key:'a' });
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
        var response = common.common.fetch({ items: {}, key:'a' });
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
        var response = common.common.getStorage();
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
        var get = spyOn(window.chrome.storage.local, 'get').and.
                callFake(function(defaults, handler) {
            handler();
        });
        var response = common.common.getStorage();
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
            var values = common.common.setDefaultValues();
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
        var get = spyOn(window.chrome.storage.local, 'get').and.
                callFake(function(defaults, handler) {
            handler({ targets: {
                cs: { config: { timeout: 90 }, label: 'C#' },
                java: { config: { timeout: 90 }, label: 'Java' },
                robot: { config: { timeout: 90 }, label: 'Robot Framework' }
            } });
        });
        var response = common.common.getStorage();
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
        var get = spyOn(window.chrome.storage.local, 'get').and.
                callFake(function(defaults, handler) {
            handler({ targets: {
                cs: { label: 'C#', template: '{{cached}}' },
                java: { label: 'Java', template: '{{cached}}' },
                robot: { label: 'Robot Framework', template: '{{cached}}' }
            } });
        });
        var response = common.common.getStorage();
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
            var values = common.common.setDefaultValues();
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
        var get = spyOn(window.chrome.storage.local, 'get').and.
                callFake(function(defaults, handler) {
            handler({ timestamp: 1 });
        });
        var response = common.common.getStorage();
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
        var get = spyOn(window.chrome.storage.local, 'get').and.
                callFake(function(defaults, handler) {
            handler();
        });
        // silent
        var log = spyOn(window.console, 'log').and.callFake(function() {});
        var response = common.common.getStorage();
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
        var get = spyOn(window.chrome.storage.local, 'get').and.
                callFake(function(defaults, handler) {
            handler();
        });
        // silent
        var log = spyOn(window.console, 'log').and.callFake(function() {});
        var response = common.common.getStorage();
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
            var values = common.common.setDefaultValues();
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
        expect(common.common.isEffective()).toBeFalsy();
    });

    it('should return false on null', function() {
        expect(common.common.isEffective(null)).toBeFalsy();
    });

    it('should return true on zero', function() {
        expect(common.common.isEffective(0)).toBeTruthy();
    });

    it('should return true on number', function() {
        expect(common.common.isEffective(1)).toBeTruthy();
    });

    it('should return true on empty string', function() {
        expect(common.common.isEffective('')).toBeTruthy();
    });

    it('should return true on string', function() {
        expect(common.common.isEffective('a')).toBeTruthy();
    });

    it('should return true on empty array', function() {
        expect(common.common.isEffective([])).toBeTruthy();
    });

    it('should return true on array', function() {
        expect(common.common.isEffective([0])).toBeTruthy();
    });

    it('should return true on empty hash', function() {
        expect(common.common.isEffective({})).toBeTruthy();
    });

    it('should return true on hash', function() {
        expect(common.common.isEffective({ key: 'value' })).toBeTruthy();
    });
});

describe('common.setDefaultValues', function() {
    it('should set root hash', function() {
        expect({}.toString.call(common.common.setDefaultValues())).toEqual('[object Object]');
    });

    it('should set attributes hash', function() {
        expect({}.toString.call(common.common.setDefaultValues().attributes)).
            toEqual('[object Object]');
    });

    it('should set attributes letter to camel case', function() {
        expect(common.common.setDefaultValues().attributes.letter).toEqual(common.LETTERS.CAMEL);
    });

    it('should set attributes letter to input value', function() {
        expect(common.common.setDefaultValues({ attributes: { letter: common.LETTERS.NATURAL } }).
            attributes.letter).not.toEqual(common.LETTERS.CAMEL);
    });

    it('should set attributes indent to false', function() {
        expect(common.common.setDefaultValues().attributes.indent).toBeFalsy();
    });

    it('should set attributes indent to input value', function() {
        expect(common.common.setDefaultValues({ attributes: { indent: true } }).
            attributes.indent).toBeTruthy();
    });

    it('should set attributes separator to breakline', function() {
        expect(common.common.setDefaultValues().attributes.separator).toEqual('\n');
    });

    it('should set attributes separator to input value', function() {
        expect(common.common.setDefaultValues({ attributes: { separator: 'a' } }).
            attributes.separator).toEqual('a');
    });

    it('should set copyright hash', function() {
        expect({}.toString.call(common.common.setDefaultValues().copyright)).
            toEqual('[object Object]');
    });

    it('should set copyright claimant to empty string', function() {
        expect(common.common.setDefaultValues().copyright.claimant).toEqual('');
    });

    it('should set copyright claimant to input value', function() {
        expect(common.common.setDefaultValues({ copyright: { claimant: 'a' } }).
            copyright.claimant).toEqual('a');
    });

    it('should set copyright year to this year', function() {
        expect(common.common.setDefaultValues().copyright.year).toEqual(new Date().getFullYear());
    });

    it('should set copyright year to input value', function() {
        expect(common.common.setDefaultValues({ copyright: { year: 3000 } }).
            copyright.year).toEqual(3000);
    });

    it('should set fill hash', function() {
        expect({}.toString.call(common.common.setDefaultValues().fill)).toEqual('[object Object]');
    });

    it('should set fill separator to empty string', function() {
        expect(common.common.setDefaultValues().fill.separator).toEqual('');
    });

    it('should set fill separator to input value', function() {
        expect(common.common.setDefaultValues({ fill: { separator: 'a' } }).
            fill.separator).toEqual('a');
    });

    it('should set model hash', function() {
        expect({}.toString.call(common.common.setDefaultValues().model)).toEqual('[object Object]');
    });

    it('should set model include to false', function() {
        expect(common.common.setDefaultValues().model.include).toBeFalsy();
    });

    it('should set model include to input value', function() {
        expect(common.common.setDefaultValues({ model: { include: true } }).
            model.include).toBeTruthy();
    });

    it('should set model name to empty string', function() {
        expect(common.common.setDefaultValues().model.name).toEqual('');
    });

    it('should set model name to input value', function() {
        expect(common.common.setDefaultValues({ model: { name: 'a' } }).
            model.name).toEqual('a');
    });

    it('should set model namespace to empty string', function() {
        expect(common.common.setDefaultValues().model.namespace).toEqual('');
    });

    it('should set model namespace to input value', function() {
        expect(common.common.setDefaultValues({ model: { namespace: 'a' } }).
            model.namespace).toEqual('a');
    });

    it('should set model target to empty string', function() {
        expect(common.common.setDefaultValues().model.target).toEqual('');
    });

    it('should set model target to input value', function() {
        expect(common.common.setDefaultValues({ model: { target: 'a' } }).
            model.target).toEqual('a');
    });

    it('should set nodes hash', function() {
        expect({}.toString.call(common.common.setDefaultValues().model)).
            toEqual('[object Object]');
    });

    it('should set nodes angular to false', function() {
        expect(common.common.setDefaultValues().nodes.angular).toBeFalsy();
    });

    it('should set nodes angular to input value', function() {
        expect(common.common.setDefaultValues({ nodes: { angular: true } }).
            nodes.angular).toBeTruthy();
    });

    it('should set nodes root to default value', function() {
        expect(common.common.setDefaultValues().nodes.root).toEqual('body');
    });

    it('should set nodes root to input value', function() {
        expect(common.common.setDefaultValues({ nodes: { root: 'a' } }).
            nodes.root).toEqual('a');
    });

    it('should set nodes selector to default value', function() {
        expect(common.common.setDefaultValues().nodes.selector).
            toEqual('a,button,input,select,textarea');
    });

    it('should set nodes selector to input value', function() {
        expect(common.common.setDefaultValues({ nodes: { selector: 'a' } }).
            nodes.selector).toEqual('a');
    });

    it('should set nodes visibility to all', function() {
        expect(common.common.setDefaultValues().nodes.visibility).toEqual(common.VISIBILITIES.ALL);
    });

    it('should set nodes visibility to input value', function() {
        expect(common.common.setDefaultValues({ nodes: { visiblity: common.VISIBILITIES.HIDDEN } }).
            nodes.visibility).not.toEqual(common.VISIBILITIES.ALL);
    });

    it('should set operations hash', function() {
        expect({}.toString.call(common.common.setDefaultValues().operations)).
            toEqual('[object Object]');
    });

    it('should set operations extras hash', function() {
        expect({}.toString.call(common.common.setDefaultValues().operations.extras)).
            toEqual('[object Object]');
    });

    it('should set operation extras fill to default value', function() {
        expect(common.common.setDefaultValues().operations.extras.fill).toEqual(1);
    });

    it('should set operations extras fill to input value', function() {
        expect(common.common.setDefaultValues({ operations: { extras: { fill: 0 } } }).
            operations.extras.fill).toEqual(0);
    });

    it('should set operation extras fill.submit to default value', function() {
        expect(common.common.setDefaultValues().operations.extras['fill.submit']).toEqual(1);
    });

    it('should set operations extras fill.submit to input value', function() {
        expect(common.common.setDefaultValues({ operations: { extras: { 'fill.submit': 0 } } }).
            operations.extras['fill.submit']).toEqual(0);
    });

    it('should set operation extras submit to default value', function() {
        expect(common.common.setDefaultValues().operations.extras.submit).toEqual(1);
    });

    it('should set operations extras submit to input value', function() {
        expect(common.common.setDefaultValues({ operations: { extras: { submit: 0 } } }).
            operations.extras.submit).toEqual(0);
    });

    it('should set operation extras verify.loaded to default value', function() {
        expect(common.common.setDefaultValues().operations.extras['verify.loaded']).toEqual(1);
    });

    it('should set operations extras verify.loaded to input value', function() {
        expect(common.common.setDefaultValues({ operations: { extras: { 'verify.loaded': 0 } } }).
            operations.extras['verify.loaded']).toEqual(0);
    });

    it('should set operation extras verify.url to default value', function() {
        expect(common.common.setDefaultValues().operations.extras['verify.url']).toEqual(1);
    });

    it('should set operations extras verify.url to input value', function() {
        expect(common.common.setDefaultValues({ operations: { extras: { 'verify.url': 0 } } }).
            operations.extras['verify.url']).toEqual(0);
    });

    it('should set operations letter to camel case', function() {
        expect(common.common.setDefaultValues().operations.letter).toEqual(common.LETTERS.CAMEL);
    });

    it('should set operations letter to input value', function() {
        expect(common.common.setDefaultValues({ operations: { letter: common.LETTERS.NATURAL } }).
            operations.letter).not.toEqual(common.LETTERS.CAMEL);
    });

    it('should set operations separator to breakline', function() {
        expect(common.common.setDefaultValues().operations.separator).toEqual('\n');
    });

    it('should set operations separator to input value', function() {
        expect(common.common.setDefaultValues({ operations: { separator: 'a' } }).
            operations.separator).toEqual('a');
    });

    it('should set timeout to default value', function() {
        expect(common.common.setDefaultValues().timeout).toEqual(15);
    });

    it('should set timeout to input value', function() {
        expect(common.common.setDefaultValues({ timeout: 10000 }).timeout).toEqual(10000);
    });
});
