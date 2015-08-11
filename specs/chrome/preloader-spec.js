/* jslint node: true */
/* global describe, it, expect */

'use strict';

describe('preloader', function() {
    afterAll(function() {
        GLOBAL.base = GLOBAL.preloader = GLOBAL.track = GLOBAL.first = null;
        GLOBAL.firstColors = GLOBAL.second = GLOBAL.secondColors = null;
    });

    beforeAll(function(done) {
        var jsdom = require('jsdom');
        jsdom.env('<html><body><div class="base"></div></body></html>',
                [__dirname + '/../../jquery-2.1.4.js'], function(err, win) {
            GLOBAL.window = win;
            GLOBAL.document = win.document;
            GLOBAL.jQuery = GLOBAL.$ = require('jquery');
            require(__dirname + '/../../src/chrome/assets/js/preloader.js');
            GLOBAL.base = $('div.base');
            GLOBAL.classes = ['first', 'second', 'third', 'fourth'];
            GLOBAL.colors = ['{{colors.[1]}}', '{{colors.[2]}}', '{{colors.[3]}}', '{{colors.[0]}}'];
            GLOBAL.preloader = base.preloader({ fadeIn: 0, fadeOut: 0 });
            GLOBAL.track = base.children('div.preloader-track');
            GLOBAL.first = track.find('div.first-half');
            GLOBAL.firstColors = first.children('div.color');
            GLOBAL.second = track.find('div.second-half');
            GLOBAL.secondColors = second.children('div.color');
            done();
        });
    });

    it('should render preloader', function() {
        expect(track.css('height')).not.toEqual('{{height}}');
        expect(track.css('top')).toEqual('0px');
        expect(first.css('background')).not.toEqual('{{colors.[0]}}');
        expect(second.css('background')).not.toEqual('{{colors.[0]}}');
        firstColors.each(function(index) {
            var this_ = $(this);
            expect(this_.css('background')).not.toEqual(colors[index]);
            expect(this_.hasClass(classes[index])).toBeTruthy();
        });
        secondColors.each(function(index) {
            var this_ = $(this);
            expect(this_.css('background')).not.toEqual(colors[index]);
            expect(this_.hasClass(classes[index])).toBeTruthy();
        });
    });

    it('should turn preloader on', function() {
        preloader.on();
        expect(track.css('display')).not.toEqual('none');
    });

    it('should turn preloader off', function() {
        preloader.off();
        expect(track.css('display')).toEqual('none');
    });
});
