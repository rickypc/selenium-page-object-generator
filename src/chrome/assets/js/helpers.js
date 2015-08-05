Handlebars.registerHelper('attributes', function(options) {
    var root = options.data.root;

    if (Handlebars.Utils.isEmpty(root.definitions)) {
        return '';
    }
    else {
        var buffer = [];
        var copies = Array.filter(root.definitions,
            function(item) { return !item.negate; });
        var index = -1;

        copies.sort(function(a, b) {
            return (a.attribute.name > b.attribute.name) ? 1 :
                ((b.attribute.name > a.attribute.name) ? -1 : 0); });

        for (var i = 0, j = copies.length; i < j; i++) {
            var copy = copies[i];

            if (root.attributes.indent) {
                copy = Object.extend(copy);
                var delta = root.attributes.longestName -
                    copy.attribute.name.length;
                var indent = '';

                if (delta > 0) {
                    indent = new Array(delta + 1).join(' ');
                }
                copy.indent = indent;
            }

            // faster array push
            buffer[++index] = options.fn(copy);
        }

        return buffer.join(root.attributes.separator);
    }
});

Handlebars.registerHelper('default', function(value, defaultValue) {
    return (typeof(value) !== 'undefined' && value !== null) ? value : defaultValue;
});

Handlebars.registerHelper('equals', function(operand1, operand2, options) {
    return (operand1 === operand2) ? options.fn(this) :
        options.inverse(this);
});

Handlebars.registerHelper('fill', function(options) {
    var root = options.data.root;

    if (Handlebars.Utils.isEmpty(root.definitions)) {
        return '';
    }
    else {
        var buffer = [];
        var copies = Array.filter(root.definitions, function(item) {
            return '|checkbox|radio|select|text|'.indexOf('|' +
                item.type + '|') > -1 && !item.negate;
        });
        var index = -1;

        copies.sort(function(a, b) {
            return (a.sourceIndex > b.sourceIndex) ? 1 :
                ((b.sourceIndex > a.sourceIndex) ? -1 : 0); });

        for (var i = 0, j = copies.length; i < j; i++) {
            // faster array push
            buffer[++index] = options.fn(copies[i]);
        }

        return buffer.join(root.fill.separator);
    }
});

Handlebars.registerHelper('lower', function(value) {
    var response = value;
    var type = typeof(value);
    if ('|string|undefined|'.indexOf('|' + type + '|') > -1 || value === null) {
        response = (value || '').toLowerCase();
    }
    return response;
});

Handlebars.registerHelper('operations', function(options) {
    var root = options.data.root;

    if (Handlebars.Utils.isEmpty(root.definitions)) {
        return '';
    }
    else {
        var buffer = [];
        var copies = Array.filter(root.definitions,
            function(item) { return !!item.operation.name; });
        var index = -1;
        copies.sort(function(a, b) {
            return (a.operation.name > b.operation.name) ? 1 :
                ((b.operation.name > a.operation.name) ? -1 : 0); });

        for (var i = 0, j = copies.length; i < j; i++) {
            // faster array push
            buffer[++index] = options.fn(copies[i]);
        }

        return buffer.join(root.operations.separator);
    }
});

Handlebars.registerHelper('proper', function(value) {
    var response = value;
    var type = typeof(value);
    if ('|string|undefined|'.indexOf('|' + type + '|') > -1 || value === null) {
        response = (value || '').replace(/[,.!?-]+/g, ' ').replace(/\s\s+/g, ' ').
            replace(/\w\S*/g, function(word) {
                return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
            });
    }
    return response;
});

Handlebars.registerHelper('unequals', function(operand1, operand2, options) {
    return (operand1 !== operand2) ? options.fn(this) :
        options.inverse(this);
});
