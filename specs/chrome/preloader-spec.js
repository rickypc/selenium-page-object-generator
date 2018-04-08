/* jslint node: true */
/* global describe, it, expect */

'use strict';

describe('preloader', function() {
    afterAll(function() {
        window.close();
        global.base = global.preloader = global.track = global.first = null;
        global.firstColors = global.second = global.secondColors = null;
    });

    beforeAll(function(done) {
        var jsdom = require('jsdom/lib/old-api.js');
        jsdom.env('<html><body><div class="base"></div></body></html>',
                [__dirname + '/../../jquery-3.3.1.js'], function(err, win) {
            global.window = win;
            global.document = win.document;
            global.jQuery = global.$ = require('jquery');
            require(__dirname + '/../../src/chrome/assets/js/preloader.js');
            global.base = $('div.base');
            global.classes = ['first', 'second', 'third', 'fourth'];
            global.colors = ['{{colors.[1]}}', '{{colors.[2]}}', '{{colors.[3]}}', '{{colors.[0]}}'];
            global.preloader = base.preloader({ fadeIn: 0, fadeOut: 0 });
            global.track = base.children('div.preloader-track');
            global.first = track.find('div.first-half');
            global.firstColors = first.children('div.color');
            global.second = track.find('div.second-half');
            global.secondColors = second.children('div.color');
            done();
        });
    });
/*
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
*/
    it('should turn preloader on', function() {
        preloader.on();
        expect(track.css('display')).not.toEqual('none');
    });
/*
    it('should turn preloader off', function() {
        preloader.off();
        expect(track.css('display')).toEqual('none');
    });
*/
});
