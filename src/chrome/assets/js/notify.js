(function($) {
    'use strict';

    var defaults = {
        hide: {
            easing: 'linear',
            speed: 1000
        },
        show: {
            easing: 'swing',
            speed: 300
        },
        timeout: 5000
    };

    $.fn.notify = function (options) {
        var context = $.extend({}, defaults, options);

        this.each(function() {
            var $this = $(this);
            var data = {
                arrow: { right: 0 },
                width:  parseInt($this.css('width'))
            };
            var html = '<div class="notify">' +
                '<div class="arrow" style="right:{{arrow.right}}px;"/>' +
                '<div class="content"/>' +
                '</div>';

            data.arrow.right = (data.width - 8) / 2;
            html = html.replace(/{{arrow.right}}/g, data.arrow.right);

            $this.after(html);
        });
       
        var $container = $(this).next('div.notify').hide();

        $container.children('div.content').click(function(e) {
            e.preventDefault();
            $(this).parent().hide();
        });

        function render(message, type) {
            type = (type) ? ' ' + type : '';

            $container.attr('class', 'notify' + type).
                children('div.content').text(message);
            $container.fadeIn(context.show.speed, context.show.easing).
                delay(context.timeout).
                fadeOut(context.hide.speed, context.hide.easing);
        }

        return {
            error: function(message) {
                render(message, 'error');
            },
            info: function(message) {
                render(message, 'info');
            },
            log: function(message) {
                render(message);
            },
            success: function(message) {
                render(message, 'success');
            },
            warn: function(message) {
                render(message, 'warn');
            }
        };
    };
}(jQuery));
