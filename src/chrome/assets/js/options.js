function getElements() {
    return {
        attributes: {
            indent: $('[id="attributes.indent"]'),
            letter: $('[id="attributes.letter"]'),
            separator: $('[id="attributes.separator"]'),
            nameFormat: $('[id="attributes.nameFormat"]'),
            customAttribute: $('[id="attributes.customAttribute"]')
        },
        copyright: {
            claimant: $('[id="copyright.claimant"]'),
            year: $('[id="copyright.year"]')
        },
        fill: {
            separator: $('[id="fill.separator"]')
        },
        model: {
            include: $('[id="model.include"]'),
            namespace: $('[id="model.namespace"]')
        },
        nodes: {
            angular: $('[id="nodes.angular"]'),
            root: $('[id="nodes.root"]'),
            selector: $('[id="nodes.selector"]'),
            visibility: $('[id="nodes.visibility"]')
        },
        notify: $('.notify'),
        operations: {
            extras: {
                fill: $('[id="operations.fill"]'),
                'fill.submit': $('[id="operations.fill.submit"]'),
                submit: $('[id="operations.submit"]'),
                'verify.loaded': $('[id="operations.verify.loaded"]'),
                'verify.url': $('[id="operations.verify.url"]'),
                'goto.page': $('[id="operations.goto.page"]')
            },
            letter: $('[id="operations.letter"]'),
            separator: $('[id="operations.separator"]')
        },
        restore: $('button.restore'),
        save: $('button.save'),
        target: $('#target'),
        template: $('#template'),
        timeout: $('#timeout')
    };
}

function loadData(elements) {
    return $.Deferred(function(defer) {
        common.getStorage().always(function(data) {
            var storage = data;

            for (var key in storage.targets) {
                elements.target.append('<option value="' + key + '">' +
                    storage.targets[key].label + '</option>');
            }

            elements.target.val(storage.target);
            elements.target.change(function(e) {
                e.preventDefault();
                var value = $(this).val();
                ga('send', 'event', 'options.target', 'change', value);
                push(elements, storage.targets[value]);
            });

            push(elements, storage.targets[storage.target]);
            defer.resolve(storage);
        });
    }).promise();
}

function pull(elements, target) {
    if (!elements || !target) {
        return;
    }

    target.config.attributes.indent = elements.attributes.indent.get(0).checked;
    target.config.attributes.nameFormat = elements.attributes.nameFormat.get(0).checked;
    target.config.attributes.letter = elements.attributes.letter.val();
    target.config.attributes.customAttribute = elements.attributes.customAttribute.val();
    target.config.attributes.separator = elements.attributes.separator.val().
        replace(/\\n/g, '\n');

    target.config.copyright.claimant = elements.copyright.claimant.val();
    target.config.copyright.year = elements.copyright.year.val();

    target.config.fill.separator = elements.fill.separator.val().
        replace(/\\n/g, '\n');

    target.config.model.namespace = elements.model.namespace.val();
    target.config.model.include = elements.model.include.get(0).checked;

    target.config.nodes.angular = elements.nodes.angular.get(0).checked;
    target.config.nodes.root = elements.nodes.root.val();
    target.config.nodes.selector = elements.nodes.selector.val();
    target.config.nodes.visibility = elements.nodes.visibility.val();

    /*
    set the default value of the options in the popup options to be checked
     */
    target.config.operations.extras.fill = elements.operations.extras.fill.
        get(0).checked;
    target.config.operations.extras['fill.submit'] = elements.operations.
        extras['fill.submit'].get(0).checked;
    target.config.operations.extras.submit = elements.operations.extras.
        submit.get(0).checked;
    target.config.operations.extras['verify.loaded'] = elements.operations.
        extras['verify.loaded'].get(0).checked;
    target.config.operations.extras['verify.url'] = elements.operations.
        extras['verify.url'].get(0).checked;
    target.config.operations.extras['goto.page'] = elements.operations.
        extras['goto.page'].get(0).checked;

    target.config.operations.letter = elements.operations.letter.val();
    target.config.operations.separator = elements.operations.separator.val().
        replace(/\\n/g, '\n');

    target.config.timeout = elements.timeout.val();
    target.template = elements.template.val();
}

function push(elements, target) {
    if (!elements || !target) {
        return;
    }

    elements.attributes.indent.get(0).checked = !!target.config.
        attributes.indent;
    elements.attributes.nameFormat.get(0).checked = !!target.config.
        attributes.nameFormat;
    elements.attributes.letter.val(target.config.attributes.letter);
    elements.attributes.separator.val(target.config.attributes.
        separator.replace(/\n/g, '\\n'));

    elements.attributes.customAttribute.val(target.config.attributes.customAttribute);

    elements.copyright.claimant.val(target.config.copyright.claimant);
    elements.copyright.year.val(target.config.copyright.year);

    elements.fill.separator.val(target.config.fill.separator.
        replace(/\n/g, '\\n'));

    elements.model.namespace.val(target.config.model.namespace);
    elements.model.include.get(0).checked = !!target.config.
        model.include;

    elements.nodes.angular.get(0).checked = !!target.config.
        nodes.angular;
    elements.nodes.root.val(target.config.nodes.root);
    elements.nodes.selector.val(target.config.nodes.selector);
    elements.nodes.visibility.val(target.config.nodes.visibility);

    elements.operations.extras.fill.get(0).checked = !!target.config.
        operations.extras.fill;
    elements.operations.extras['fill.submit'].get(0).checked = !!target.config.
        operations.extras['fill.submit'];
    elements.operations.extras.submit.get(0).checked = !!target.config.
        operations.extras.submit;
    elements.operations.extras['verify.loaded'].get(0).checked = !!target.config.
        operations.extras['verify.loaded'];
    elements.operations.extras['verify.url'].get(0).checked = !!target.config.
        operations.extras['verify.url'];
    elements.operations.extras['goto.page'].get(0).checked = !!target.config.
        operations.extras['goto.page'];

    elements.operations.letter.val(target.config.operations.letter);
    elements.operations.separator.val(target.config.operations.
        separator.replace(/\n/g, '\\n'));

    elements.timeout.val(target.config.timeout);
    elements.template.val(target.template);
}

$(document).ready(function() {
    // Standard Google Universal Analytics code
    (function(i,s,o,g,r,a,m){i.GoogleAnalyticsObject=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments);},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-325170-7', 'auto');
    // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
    ga('set', 'checkProtocolTask', null);
    ga('send', 'pageview', '/options.html');

    var elements = getElements();
    var preloader = $('.preloader').preloader();
    var storage = {};

    elements.save.click(function(e) {
        e.preventDefault();
        ga('send', 'event', 'save', 'click');
        preloader.on();

        storage.target = elements.target.val();
        pull(elements, storage.targets[storage.target]);
        storage.timestamp = new Date().valueOf();

        chrome.storage.local.set(storage, function() {
            preloader.off();
            elements.notify.text(storage.targets[storage.target].label + ' settings saved.');

            setTimeout(function() {
                elements.notify.text('');
            }, 5000);
        });
    });

    elements.restore.click(function(e) {
        e.preventDefault();
        ga('send', 'event', 'restore', 'click');
        preloader.on();

        chrome.storage.local.clear(function() {
            elements.target.unbind('change').empty();

            // reload the data
            loadData(elements).done(function(data) {
                storage = data;
                preloader.off();
                elements.notify.text('All options are restored to their original defaults.');

                setTimeout(function() {
                    elements.notify.text('');
                }, 5000);
            });
        });
    });

    loadData(elements).done(function(data) {
        storage = data;
    });
});
