/* jslint node: true */
/* global describe, it, expect */

'use strict';

describe('notify', function() {
    afterAll(function() {
        GLOBAL.base = GLOBAL.box = GLOBAL.content = GLOBAL.notifier = null;
    });

    beforeAll(function(done) {
        var jsdom = require('jsdom');
        jsdom.env('<html><body><div class="base"></div></body></html>',
                [__dirname + '/../../jquery-2.1.4.js'], function(err, win) {
            GLOBAL.window = win;
            GLOBAL.document = win.document;
            GLOBAL.jQuery = GLOBAL.$ = require('jquery');
            require(__dirname + '/../../src/chrome/assets/js/notify.js');
            GLOBAL.base = $('div.base');
            GLOBAL.notifier = base.notify({ hide: { speed: 0 }, show: { speed: 0 }, timeout: 100 });
            GLOBAL.box = base.next('div.notify');
            GLOBAL.arrow = box.children('div.arrow');
            GLOBAL.content = box.children('div.content');
            done();
        });
    });

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
});
