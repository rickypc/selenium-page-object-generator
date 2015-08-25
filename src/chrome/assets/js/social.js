(function($) {
    'use strict';

    var isOpera = !!navigator.userAgent.match(/Opera|OPR\//);
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
                url: 'https://plus.google.com/share?url={{url}}'
            },
            linkedin: {
                url: 'https://www.linkedin.com/shareArticle?mini=true&summary={{summary}}&title={{title}}&url={{url}}'
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
                url: (isOpera) ? '{{url}}/#feedback-container' : '{{url}}/reviews',
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
        summary: 'Selenium Page Object Generator is a nimble and flexible #Selenium ' +
            '#PageObjectModel #Generator to improve #Agile #Testing process velocity.',
        target: (isOpera) ? 'https://addons.opera.com/en/extensions/details/selenium-page-object-generator' :
            'https://chrome.google.com/webstore/detail/' + chrome.runtime.id,
        // linkedin
        title: 'Selenium Page Object Generator - to improve agile testing process velocity.'
    };

    function getFeatures(input) {
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
        var height = screen.height;
        var left = window.screenLeft || screen.left;
        var setting = input.context.settings[input.type] || {};
        var top = window.screenTop || screen.top;
        var width = screen.width;
        features.height = setting.height || 600;
        features.width = setting.width || 600;
        features.left = (width / 2) - (features.width / 2);
        features.top = (height / 2) - (features.height / 2);

        return Object.keys(features).map(function(key) { return key + '=' + features[key]; }).join(',');
    }

    function getUrl(input) {
        var context = input.context;
        var setting = context.settings[input.type] || {};
        var url = setting.url || '';

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
