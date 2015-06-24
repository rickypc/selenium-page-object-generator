;
(function($) {
    'use strict';

    var defaults = {
        colors: [ '#ff002b', '#0089fa', '#ffa900', '#00a753' ],
        fadeIn: 200,
        fadeOut: 200,
        height: '5px',
        position: 'top'
    };

    $.fn.preloader = function (options) {
        var context = $.extend({}, defaults, options);
        var source =
            '<div class="preloader-track" style="height:{{height}};{{position}}:0;display:none;">' +
                '<div class="band">' +
                    '<div class="first-half" style="background:{{colors.[0]}}">' +
                        '<div class="color first" style="background:{{colors.[1]}}"></div>' +
                        '<div class="color second" style="background:{{colors.[2]}}"></div>' +
                        '<div class="color third" style="background:{{colors.[3]}}"></div>' +
                        '<div class="color fourth" style="background:{{colors.[0]}}"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="band">' +
                    '<div class="second-half" style="background:{{colors.[0]}}">' +
                        '<div class="color first" style="background:{{colors.[1]}}"></div>' +
                        '<div class="color second" style="background:{{colors.[2]}}"></div>' +
                        '<div class="color third" style="background:{{colors.[3]}}"></div>' +
                        '<div class="color fourth" style="background:{{colors.[0]}}"></div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        var template = source.replace(/{{height}}/g, context.height).
                              replace(/{{position}}/g, context.position).
                              replace(/{{colors\.\[0\]}}/g, context.colors[0]).
                              replace(/{{colors\.\[1\]}}/g, context.colors[1]).
                              replace(/{{colors\.\[2\]}}/g, context.colors[2]).
                              replace(/{{colors\.\[3\]}}/g, context.colors[3]);

        this.each(function() {
            $(this).prepend(template);
        });

        var preloader = $('.preloader-track');

        return {
            off: function() {
                preloader.fadeOut(context.fadeOut);
            },
            on: function() {
                preloader.fadeIn(context.fadeIn);
            }
        };
    };
}(jQuery));
