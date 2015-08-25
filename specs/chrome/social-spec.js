/* jslint node: true */
/* global describe, it, expect */

'use strict';

describe('social', function() {
    afterAll(function() {
        GLOBAL.base = GLOBAL.classes = GLOBAL.ga = GLOBAL.analytics = null;
        GLOBAL.navigator = GLOBAL.open = GLOBAL.screen = GLOBAL.social = null;
    });

    beforeAll(function(done) {
        var jsdom = require('jsdom');
        jsdom.env('<html><body><div class="base"></div></body></html>',
                [__dirname + '/../../jquery-2.1.4.js'], function(err, win) {
            GLOBAL.window = win;
            GLOBAL.document = win.document;
            GLOBAL.navigator = { userAgent: 'chrome' };
            GLOBAL.chrome = { runtime: { id: 'a' } };
            GLOBAL.jQuery = GLOBAL.$ = require('jquery');
            require(__dirname + '/../../src/chrome/assets/js/social.js');
            GLOBAL.base = $('div.base');
            GLOBAL.classes = ['fa-envelope', 'fa-twitter', 'fa-facebook',
                              'fa-google-plus', 'fa-linkedin', 'fa-star', 'fa-unknown'];
            GLOBAL.ga = function() {};
            GLOBAL.analytics = spyOn(GLOBAL, 'ga').and.callThrough();
            GLOBAL.open = spyOn(window, 'open').and.callFake(function() {});
            for (var i=0, j=classes.length; i<j; i++) {
                base.append('<a class="fa ' + classes[i] + '">');
            }
            GLOBAL.screen = { height: 0, left: 0, top: 0, width: 0 };
            GLOBAL.social = base.children('a').social();
            done();
        });
    });

    it('should prepare and open the links', function() {
        var args = {
            facebook: ['https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fa', 'facebook_window', 'copyhistory=no,directories=no,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,height=436,width=626,left=-313,top=-218'],
            'google-plus': ['https://plus.google.com/share?url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fa', 'google-plus_window', 'copyhistory=no,directories=no,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,height=600,width=600,left=-300,top=-300'],
            linkedin: ['https://www.linkedin.com/shareArticle?mini=true&summary=Selenium%20Page%20Object%20Generator%20is%20a%20nimble%20and%20flexible%20%23Selenium%20%23PageObjectModel%20%23Generator%20to%20improve%20%23Agile%20%23Testing%20process%20velocity.&title=Selenium%20Page%20Object%20Generator%20-%20to%20improve%20agile%20testing%20process%20velocity.&url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fa', 'linkedin_window', 'copyhistory=no,directories=no,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,height=600,width=600,left=-300,top=-300'],
            star: ['https://chrome.google.com/webstore/detail/a/reviews', 'star_window', 'copyhistory=no,directories=no,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,height=350,width=900,left=-450,top=-175'],
            twitter: ['https://twitter.com/share?text=Selenium%20Page%20Object%20Generator%20is%20a%20nimble%20and%20flexible%20%23Selenium%20%23PageObjectModel%20%23Generator%20to%20improve%20%23Agile%20%23Testing%20process%20velocity.&url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fa&via=rickypc2000', 'twitter_window', 'copyhistory=no,directories=no,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,height=500,width=685,left=-342.5,top=-250'],
            unknown: ['', 'unknown_window', 'copyhistory=no,directories=no,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,height=600,width=600,left=-300,top=-300']
        };

        social.each(function(index) {
            var this_ = $(this);
            expect(this_.hasClass('fa-' + this_.data('type'))).toBeTruthy();

            if (this_.data('type') === 'envelope') {
                this_.get(0).onclick = function() {};
                var envelope = spyOn(this_.get(0), 'onclick').and.callThrough();
                expect(this_.get(0).href).toEqual('mailto:?subject=Selenium%20Page%20Object%20Generator%20-%20to%20improve%20agile%20testing%20process%20velocity.&body=Selenium%20Page%20Object%20Generator%20is%20a%20nimble%20and%20flexible%20%23Selenium%20%23PageObjectModel%20%23Generator%20to%20improve%20%23Agile%20%23Testing%20process%20velocity.%20https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fa');
                expect(this_.get(0).target).toEqual('_blank');
                // more coverage
                this_.trigger('click');
                expect(envelope).toHaveBeenCalled();
            }
            else {
                this_.trigger('click');
                expect(analytics).toHaveBeenCalledWith('send', 'event', this_.data('type'), 'click');
                expect(open).toHaveBeenCalledWith.apply(expect(open), args[this_.data('type')]);
                // more coverage
                this_.trigger('click');
                expect(analytics).toHaveBeenCalledWith('send', 'event', this_.data('type'), 'click');
                expect(open).toHaveBeenCalledWith.apply(expect(open), args[this_.data('type')]);
            }
        });
    });
});
