(function($) {
    'use strict';

    var defaults = {
        // pinterest
        //cover: 'assets/image/cover.png',
        settings: {
            envelope: {
                height: 1,
                url: 'mailto:?subject={{title}}&body={{summary}} {{url}}',
                width: 1
            },
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
            star: {
                height: 350,
                unencoded: 1,
                url: '{{url}}/reviews',
                width: 900
            },
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

        if (input.type) {
            var height = screen.height;
            var left = window.screenLeft || screen.left;
            var setting = input.context.settings[input.type];
            var top = window.screenTop || screen.top;
            var width = screen.width;
            features.height = setting.height;
            features.width = setting.width;
            features.left = (width / 2) - (setting.width / 2);
            features.top = (height / 2) - (setting.height / 2);
        }

        return Object.keys(features).map(function(key) { return key + '=' + features[key]; }).join(',');
    }

    function getUrl(input) {
        input = input || {};
        var url = '';

        if (input.type) {
            var context = input.context;
            var setting = context.settings[input.type];
            url = setting.url;

            if (typeof(setting.caller) !== 'undefined') {
                url = url.replace(/{{caller}}/g, encodeURIComponent(setting.caller));
            }

            if (!!setting.unencoded) {
                url = url.replace(/{{cover}}/g, context.cover).
                          replace(/{{summary}}/g, context.summary).
                          replace(/{{title}}/g, context.title).
                          replace(/{{url}}/g, context.target);
            }
            else {
                url = url.replace(/{{cover}}/g, encodeURIComponent(context.cover)).
                          replace(/{{summary}}/g, encodeURIComponent(context.summary)).
                          replace(/{{title}}/g, encodeURIComponent(context.title)).
                          replace(/{{url}}/g, encodeURIComponent(context.target));
            }
        }

        return url;
    }

    $.fn.social = function (options) {
        var context = $.extend({}, defaults, options);

        return this.each(function() {
            var $this = $(this);
            var type = $this.attr('class').replace(/fa\s+|fa-/g, '');
            $this.data('type', type);

            if (type === 'envelope') {
                $this[0].href = getUrl({ context: context, type: type });
                $this[0].target = '_blank';
            }

            $this.bind('click', function (e) {
                var $target = $(e.target);
                var data = $target.data();
                var win = true;
                ga('send', 'event', data.type, 'click');

                if (data.type !== 'envelope') {
                    if (!data.features) {
                        var features = getFeatures({ context:context, type:type });
                        $target.data('features', features);
                        data.features = features;
                    }

                    if (!data.url) {
                        var url = getUrl({ context: context, type: type });
                        $target.data('url', url);
                        data.url = url;
                    }

                    e.preventDefault();
                    win = window.open(data.url, data.type + '_window', data.features);
                }

                return win;
            });
        });
    };
}(jQuery));
