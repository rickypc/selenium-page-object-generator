/* jslint node: true */
/* global describe, it, expect */

'use strict';

describe('notify', function() {
    afterAll(function() {
        window.close();
        global.base = global.box = global.content = global.notifier = null;
    });

    beforeAll(function(done) {
        var jsdom = require('jsdom/lib/old-api.js');
        jsdom.env('<html><body><div class="base"></div></body></html>',
                [__dirname + '/../../jquery-3.3.1.js'], function(err, win) {
            global.window = win;
            global.document = win.document;
            global.jQuery = global.$ = require('jquery');
            require(__dirname + '/../../src/chrome/assets/js/notify.js');
            global.base = $('div.base');
            global.notifier = base.notify({ hide: { speed: 0 }, show: { speed: 0 }, timeout: 100 });
            global.box = base.next('div.notify');
            global.arrow = box.children('div.arrow');
            global.content = box.children('div.content');
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
        }, 1500);
    }, 1600);
});
