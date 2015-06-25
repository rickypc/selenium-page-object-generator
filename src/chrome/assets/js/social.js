(function($) {
    'use strict';

    var defaults = {
        // pinterest
        //cover: 'assets/image/cover.png',
        settings: {
            facebook: {
                height: 436,
                url: 'https://www.facebook.com/sharer/sharer.php?u={{url}}',
                width: 626
            },
            'google-plus': {
                height: 600,
                url: 'https://plus.google.com/share?url={{url}}',
                width: 600
            },
            linkedin: {
                height: 600,
                url: 'https://www.linkedin.com/shareArticle?mini=true&summary={{summary}}&title={{title}}&url={{url}}',
                width: 600
            },
/*
            pinterest: {
                height: 500,
                url: 'http://pinterest.com/pin/create/button/?description={{summary}}&media={{cover}}&url={{url}}',
                width: 685
            },
*/
            twitter: {
                caller: 'rickypc2000',
                height: 500,
                url: 'https://twitter.com/share?text={{summary}}&url={{url}}&via={{caller}}',
                width: 685
            }
        },
        // all, except fb and g+
        summary: 'Selenium Page Object Generator is a nimble and flexible #Selenium #PageObjectModel #Generator to improve #Agile #Testing process velocity.',
        target: 'https://chrome.google.com/webstore/detail/' + chrome.runtime.id,
        // linkedin
        title: 'Selenium Page Object Generator - to improve agile testing process velocity.'
    };

    function getFeatures(input) {
        input = input || {};
        var features = {
            copyhistory: 'no',
            directories: 'no',
            'location': 'no',
            menubar: 'no',
            resizable: 'no',
            scrollbars: 'no',
            'status': 'no',
            toolbar: 'no'
        };

        if (input.el && input.type) {
            var setting = input.context.settings[input.type];
            features.height = setting.height;
            features.width = setting.width;
            features.left = (setting.width / 2);
            features.top = (setting.height / 2);
        }

        return Object.keys(features).map(function(key) { return key + '=' + features[key]; }).join(',');
    }

    function getUrl(input) {
        input = input || {};
        var url = '';

        if (input.el && input.type) {
            var context = input.context;
            var setting = context.settings[input.type];
            url = setting.url;

            if (typeof(setting.caller) !== 'undefined') {
                url = url.replace(/{{caller}}/g, encodeURIComponent(setting.caller));
            }

            url = url.replace(/{{cover}}/g, encodeURIComponent(context.cover)).
                      replace(/{{summary}}/g, encodeURIComponent(context.summary)).
                      replace(/{{title}}/g, encodeURIComponent(context.title)).
                      replace(/{{url}}/g, encodeURIComponent(context.target));
        }

        return url;
    }

    $.fn.social = function (options) {
        var context = $.extend({}, defaults, options);

        return this.each(function() {
            var $this = $(this);

            $this.bind('click', function (e) {
                e.preventDefault();

                var type = $this.attr('class').replace(/fa\s+|fa-/g, '');
                ga('send', 'event', type, 'click');
                var features = getFeatures({ context:context, el:$this, type:type });
                var url = getUrl({ context: context, el: $this, type: type });

                return window.open(url, type + '_window', features);
            });
        });
    };
}(jQuery));
