/* jslint node: true */
/* global describe, it, expect */

'use strict';

GLOBAL.window = GLOBAL;
window.Handlebars = {
    helpers: {},
    registerHelper: function(name, handler) {
        this.helpers[name] = handler;
    },
    Utils: {
        isEmpty: function (value) {
            return (!value || value === 0 || value.length === 0 || !Object.keys(value).length);
        }
    }
};

require(__dirname + '/../../src/chrome/assets/js/helpers.js');

describe('helpers.attributes', function() {
    it('should return empty on hash without definitions', function() {
        var isEmpty = spyOn(window.Handlebars.Utils, 'isEmpty').and.callThrough();
        expect(Handlebars.helpers.attributes({ data: { root: {} } })).toEqual('');
        expect(isEmpty).toHaveBeenCalledWith(undefined);
    });

    it('should return expected value without negate definitions', function() {
        var definitions = [{ attribute: { name: 'b' }, negate: 0 },
                           { attribute: { name: 'b' }, negate: 0 },
                           { attribute: { name: 'a' }, negate: 1 },
                           { attribute: { name: 'a' }, negate: 0 },
                           { attribute: { name: 'c' }, negate: 0 }];
        var options = {
            data: { root: { attributes: { indent: 0, separator: '-' },
                            definitions: definitions } },
            fn: function(item) { return item.attribute.name; } };
        var filter = spyOn(Array, 'filter').and.callThrough();
        var isEmpty = spyOn(window.Handlebars.Utils, 'isEmpty').and.callThrough();
        var join = spyOn(Array.prototype, 'join').and.callThrough();
        var logic = spyOn(options, 'fn').and.callThrough();
        var sort = spyOn(Array.prototype, 'sort').and.callThrough();
        expect(Handlebars.helpers.attributes(options)).toEqual('a-b-b-c');
        expect(filter).toHaveBeenCalled();
        expect(filter.calls.count()).toEqual(1);
        expect(isEmpty).toHaveBeenCalledWith(definitions);
        expect(isEmpty.calls.count()).toEqual(1);
        expect(join).toHaveBeenCalledWith('-');
        expect(join.calls.count()).toEqual(1);
        expect(logic).toHaveBeenCalled();
        expect(logic.calls.count()).toEqual(4);
        expect(sort).toHaveBeenCalled();
        expect(sort.calls.count()).toEqual(1);
    });

    it('should return expected value with indent', function() {
        var definitions = [{ attribute: { name: 'bc' }, negate: 0 },
                           { attribute: { name: 'b' }, negate: 0 },
                           { attribute: { name: 'a' }, negate: 1 },
                           { attribute: { name: 'abc' }, negate: 0 },
                           { attribute: { name: 'c' }, negate: 0 }];
        var options = {
            data: { root: { attributes: { indent: 1, longestName: 3, separator: '-' },
                            definitions: definitions } },
            fn: function(item) { return '|' + item.indent + '|' + item.attribute.name; } };
        var extend = spyOn(Object, 'extend').and.callThrough();
        var filter = spyOn(Array, 'filter').and.callThrough();
        var isEmpty = spyOn(window.Handlebars.Utils, 'isEmpty').and.callThrough();
        var join = spyOn(Array.prototype, 'join').and.callThrough();
        var logic = spyOn(options, 'fn').and.callThrough();
        var sort = spyOn(Array.prototype, 'sort').and.callThrough();
        expect(Handlebars.helpers.attributes(options)).toEqual('||abc-|  |b-| |bc-|  |c');
        expect(extend).toHaveBeenCalled();
        expect(extend.calls.count()).toEqual(4);
        expect(filter).toHaveBeenCalled();
        expect(filter.calls.count()).toEqual(1);
        expect(isEmpty).toHaveBeenCalledWith(definitions);
        expect(isEmpty.calls.count()).toEqual(1);
        expect(join).toHaveBeenCalledWith('-');
        expect(join).toHaveBeenCalledWith(' ');
        // 3 indent calls + 1 buffer call
        expect(join.calls.count()).toEqual(4);
        expect(logic).toHaveBeenCalled();
        expect(logic.calls.count()).toEqual(4);
        expect(sort).toHaveBeenCalled();
        expect(sort.calls.count()).toEqual(1);
    });

    it('should return expected value with separator', function() {
        var definitions = [{ attribute: { name: 'b' }, negate: 0 },
                           { attribute: { name: 'b' }, negate: 0 },
                           { attribute: { name: 'a' }, negate: 1 },
                           { attribute: { name: 'a' }, negate: 0 },
                           { attribute: { name: 'c' }, negate: 0 }];
        var options = {
            data: { root: { attributes: { indent: 0, separator: '$$$' },
                            definitions: definitions } },
            fn: function(item) { return item.attribute.name; } };
        var filter = spyOn(Array, 'filter').and.callThrough();
        var isEmpty = spyOn(window.Handlebars.Utils, 'isEmpty').and.callThrough();
        var join = spyOn(Array.prototype, 'join').and.callThrough();
        var logic = spyOn(options, 'fn').and.callThrough();
        var sort = spyOn(Array.prototype, 'sort').and.callThrough();
        expect(Handlebars.helpers.attributes(options)).toEqual('a$$$b$$$b$$$c');
        expect(filter).toHaveBeenCalled();
        expect(filter.calls.count()).toEqual(1);
        expect(isEmpty).toHaveBeenCalledWith(definitions);
        expect(isEmpty.calls.count()).toEqual(1);
        expect(join).toHaveBeenCalledWith('$$$');
        expect(join.calls.count()).toEqual(1);
        expect(logic).toHaveBeenCalled();
        expect(logic.calls.count()).toEqual(4);
        expect(sort).toHaveBeenCalled();
        expect(sort.calls.count()).toEqual(1);
    });
});

describe('helpers.default', function() {
    it('should return undefined on undefined default value', function() {
        expect(Handlebars.helpers.default()).toBeUndefined();
    });

    it('should return null on null default value', function() {
        expect(Handlebars.helpers.default(undefined, null)).toBeNull();
    });

    it('should return zero on zero default value', function() {
        expect(Handlebars.helpers.default(undefined, 0)).toEqual(0);
    });

    it('should return number on number default value', function() {
        expect(Handlebars.helpers.default(undefined, 1)).toEqual(1);
    });

    it('should return empty string on empty string default value', function() {
        expect(Handlebars.helpers.default(undefined, '')).toEqual('');
    });

    it('should return string on string default value', function() {
        expect(Handlebars.helpers.default(undefined, 'a')).toEqual('a');
    });

    it('should return empty array on empty array default value', function() {
        expect(Handlebars.helpers.default(undefined, [])).toEqual([]);
    });

    it('should return array on array default value', function() {
        expect(Handlebars.helpers.default(undefined, [0])).toEqual([0]);
    });

    it('should return empty hash on empty hash default value', function() {
        expect(Handlebars.helpers.default(undefined, {})).toEqual({});
    });

    it('should return hash on hash default value', function() {
        expect(Handlebars.helpers.default(undefined, {'key': 'a'})).
            toEqual({'key': 'a'});
    });

    it('should return function on function default value', function() {
        var func = function() {};
        expect(Handlebars.helpers.default(undefined, func)).toEqual(func);
    });

    it('should return default value on undefined value', function() {
        expect(Handlebars.helpers.default(undefined, 'a')).toEqual('a');
    });

    it('should return default value on null value', function() {
        expect(Handlebars.helpers.default(null, 'a')).toEqual('a');
    });

    it('should return zero on zero value', function() {
        expect(Handlebars.helpers.default(0, 'a')).toEqual(0);
    });

    it('should return number on number value', function() {
        expect(Handlebars.helpers.default(1, 'a')).toEqual(1);
    });

    it('should return number on number value', function() {
        expect(Handlebars.helpers.default('', 'a')).toEqual('');
    });

    it('should return string on string value', function() {
        expect(Handlebars.helpers.default('b', 'a')).toEqual('b');
    });

    it('should return empty array on empty array value', function() {
        expect(Handlebars.helpers.default([], 'a')).toEqual([]);
    });

    it('should return array on array value', function() {
        expect(Handlebars.helpers.default([0], 'a')).toEqual([0]);
    });

    it('should return empty hash on empty hash value', function() {
        expect(Handlebars.helpers.default({}, 'a')).toEqual({});
    });

    it('should return hash on hash value', function() {
        expect(Handlebars.helpers.default({'key': 'a'}, 'a')).toEqual({'key': 'a'});
    });

    it('should return function on function value', function() {
        var func = function() {};
        expect(Handlebars.helpers.default(func, 'a')).toEqual(func);
    });
});
