/* jslint node: true */
/* global describe, it, expect */

'use strict';

xdescribe('popup', function() {
    afterAll(function() {
        window.close();
        GLOBAL.base = GLOBAL.box = GLOBAL.content = GLOBAL.notifier = null;
    });

    beforeAll(function(done) {
        var jsdom = require('jsdom/lib/old-api.js');
        jsdom.env('<html><body><button class="generate"></button><a class="downloader"></a>' +
                '<input type="text" id="model.name"/><input type="text" id="model.target"/>' +
                '<select id="target"></select></body></html>',
                [__dirname + '/../../jquery-3.3.1.js'], function(err, win) {
            GLOBAL.window = win;
            GLOBAL.document = win.document;
            GLOBAL.chrome = {
                storage: { local: { get: function() {} } },
                tabs: { executeScript: function(defaults, config, handler) {} }
            };
            GLOBAL.jQuery = GLOBAL.$ = require('jquery');
            $.fn.notify = function () {
                return { error: function(message) {}, success: function(message) {} };
            };
            $.fn.preloader = function () {
                return { off: function() {}, on: function() {} };
            };
            $.fn.social = function () {
                return this;
            };
            require(__dirname + '/../../src/chrome/assets/js/popup.js');
            GLOBAL.downloader = $('button.downloader');
            GLOBAL.ga = function() {};
            GLOBAL.analytics = spyOn(GLOBAL, 'ga').and.callThrough();
            GLOBAL.generate = $('button.generate');
            GLOBAL.modelName = $('[id="model.name"]');
            GLOBAL.modelTarget = $('[id="model.target"]');
            GLOBAL.target = $('#target');
            done();
        });
    });

//    it('should download content', function() {
//        download(downloader, 'name', 'content');
//    });

/*
    beforeEach(function() {
        box.show();
    });

    it('should render error message', function() {
        notifier.error('message');
        expect(box.css('display')).not.toEqual('none');
        expect(box.hasClass('error')).toBeTruthy();
        expect(box.hasClass('notify')).toBeTruthy();
        expect(arrow.css('right')).not.toEqual('{{arrow.right}}px');
        expect(content.text()).toEqual('message');
        content.trigger('click');
        expect(box.css('display')).toEqual('none');
    });

    it('should render info message', function() {
        notifier.info('message');
        expect(box.css('display')).not.toEqual('none');
        expect(box.hasClass('info')).toBeTruthy();
        expect(box.hasClass('notify')).toBeTruthy();
        expect(arrow.css('right')).not.toEqual('{{arrow.right}}px');
        expect(content.text()).toEqual('message');
        content.trigger('click');
        expect(box.css('display')).toEqual('none');
    });

    it('should render log message', function() {
        notifier.log('message');
        expect(box.css('display')).not.toEqual('none');
        expect(box.hasClass('notify')).toBeTruthy();
        expect(arrow.css('right')).not.toEqual('{{arrow.right}}px');
        expect(content.text()).toEqual('message');
        content.trigger('click');
        expect(box.css('display')).toEqual('none');
    });

    it('should render success message', function() {
        notifier.success('message');
        expect(box.css('display')).not.toEqual('none');
        expect(box.hasClass('success')).toBeTruthy();
        expect(box.hasClass('notify')).toBeTruthy();
        expect(arrow.css('right')).not.toEqual('{{arrow.right}}px');
        expect(content.text()).toEqual('message');
        content.trigger('click');
        expect(box.css('display')).toEqual('none');
    });

    it('should render warn message', function() {
        notifier.warn('message');
        expect(box.css('display')).not.toEqual('none');
        expect(box.hasClass('warn')).toBeTruthy();
        expect(box.hasClass('notify')).toBeTruthy();
        expect(arrow.css('right')).not.toEqual('{{arrow.right}}px');
        expect(content.text()).toEqual('message');
        content.trigger('click');
        expect(box.css('display')).toEqual('none');
    });

    it('should hide the box in requested timeout', function(done) {
        notifier.log('message');
        expect(box.css('display')).not.toEqual('none');
        expect(box.hasClass('notify')).toBeTruthy();
        expect(arrow.css('right')).not.toEqual('{{arrow.right}}px');
        expect(content.text()).toEqual('message');
        setTimeout(function() {
            expect(box.css('display')).toEqual('none');
            done();
        }, 750);
    });
*/
});
