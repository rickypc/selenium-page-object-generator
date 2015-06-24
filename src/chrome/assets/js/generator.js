window.POG=(function() {
    // to compartment any js error on the page
    var ELEMENT_NODE = 1;
    var SHOW_COMMENT = 128;

    // ========================================================================
    // private functions

    function getComments(root) {
        var comments = [];
        var index = -1;
        var walker = document.createTreeWalker(root, SHOW_COMMENT, null, false);

        while (walker.nextNode()) {
            comments[++index] = walker.currentNode;
        }

        return comments;
    }

    function getCSSSelector(node) {
        var selector = '';

        for (; node && node.nodeType === ELEMENT_NODE; node = node.parentNode) {

            if (node.id) {
                selector = '#' + node.id + ' ' + selector;
                break;
            }
            else {
                var nodeName = node.nodeName;
                var currentSelector = nodeName.toLowerCase();
                var index = getNodeIndex(node, nodeName);

                if (node.className !== '') {
                    currentSelector += '.' + node.className.split(/\s+/g).join('.');
                }

                if (nodeName === 'INPUT' && node.getAttribute('type')) {
                    currentSelector += '[type=\'' + node.getAttribute('type') + '\']';
                }

                if (index > 0) {
                    currentSelector += ':nth-child(' + index + ')';
                }

                selector = currentSelector + ' ' + selector;
            }
        }

        return selector.replace(/^html body/, 'body').replace(/^\s+|\s+$/g, '');
    }

    function getDefinition(input) {
        input = input || {};
        var actionLowered = input.action.toLowerCase();
        var buffer = Object.extend(input.buffer);
        buffer.attribute = Object.extend(input.buffer.attribute);
        buffer.operation = Object.extend(input.buffer.operation);
        var suffixes = {
            action: (actionLowered === 'click') ? ' on' : '',
            label: (actionLowered === 'set') ? ' Field' : ''
        };
        suffixes.documentation = ' ' + getLetter(input.text, LETTERS.NATURAL) +
            ' ' + (input.label + suffixes.label.toLowerCase()) + '.';
        suffixes.name = ' ' + input.text + ' ' + input.label + suffixes.label;

        if (input.negate) {
            input.action = 'Un' + actionLowered;
            buffer.negate = 1;
        }

        if (input.hasArgument) {
            suffixes.action = (input.negate) ? ' value from' : ' value to';
            buffer.argument = {};
            buffer.argument.documentation = input.action + ' default' +
                suffixes.action + suffixes.documentation;
            buffer.argument.key = getLetter(input.text, LETTERS.UPPER);
            buffer.argument.name = getLetter(input.text + ' value',
                input.letters.attribute);
        }

        buffer.attribute.name = getLetter(input.text, input.letters.attribute);
        buffer.operation.documentation = input.action + suffixes.action +
            suffixes.documentation;
        buffer.operation.name = getLetter(input.action + suffixes.name,
            input.letters.operation);

        return buffer;
    }

    function getFileName(path) {
        return path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
    }

    function getHiddens(cloned, original) {
        var clones = cloned.getElementsByTagName('*');
        var originals = original.getElementsByTagName('*');
        var hiddens = Array.filter(cloned.querySelectorAll(
            '*:not(br):not(img):not(input):not(link):not(option):not(script):not(select):not(style)'),
            function(item, index) { var sourceIndex = [].indexOf.call(clones, item);
                return originals[sourceIndex].offsetHeight < 1 });
        return hiddens;
    }

    function getLetter(value, type) {
        type = type || LETTERS.CAMEL;
        type = parseInt(type);
        value = value || '';

        switch (type) {
            case LETTERS.LOWER:
            case LETTERS.UPPER:
                value = value.replace(/\./g, '_').replace(/\s+|__|-/g, '_').replace(/^_|_$/g, '');
                value = (type === LETTERS.LOWER) ? value.toLowerCase() : value.toUpperCase();
                break;
            case LETTERS.CAMEL:
            case LETTERS.NATURAL:
            case LETTERS.PROPER:
                value = value.replace(/[,!?-]+/g, ' ').replace(/\.|__/g, '_').replace(/^_|_$/g, '').
                    replace(/\s\s+|\s+_|_\s+/g, ' ').replace(/\w\S*/g, function(word) {
                        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
                    });

                if (type === LETTERS.CAMEL || type === LETTERS.PROPER) {
                    value = value.replace(/\s+/g, '');

                    if (type === LETTERS.CAMEL) {
                        value = value.charAt(0).toLowerCase() + value.substr(1);
                    }
                }
                break;
        }

        return value;
    }

    function getNodeIndex(node, nodeName) {
        var count = 1;
        var sibling = node;
        nodeName = nodeName || node.nodeName;

        while (sibling = sibling.previousSibling) {
            if (sibling.nodeType === ELEMENT_NODE && sibling.nodeName === nodeName) {
                count++;
            }
        }

        // reset count if it doesn't have nextSibling
        if (count === 1) {
            var found = false;
            sibling = node;

            while (sibling = sibling.nextSibling) {
                if (sibling.nodeType === ELEMENT_NODE && sibling.nodeName === nodeName) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                count = 0;
            }
        }

        return count;
    }

    function getPageVisibleHTML(original) {
        original = original || document.body;
        var cloned = original.cloneNode(true);
        var comments = getComments(cloned);
        var excludes = cloned.querySelectorAll('img,input,link,option,script,select,style');
        var hiddens = getHiddens(cloned, original);

        removeNodes(comments);
        removeNodes(excludes);
        removeNodes(hiddens);

        return cloned.outerHTML;
    }

    function getSentences(text, minimumWords) {
        minimumWords = minimumWords || 5;
        var index = -1;
        var response = [];
        var sentences = text.match(/[^\r\n.!?]+/gi) || [];

        for (var i = 0, j = sentences.length; i < j; i++) {
            var sentence = sentences[i].replace(/^\s+|\s+$/g, '');

            if (sentence !== '') {
                var words = (sentence.match(/\b\w+\b/gi) || []).length;
                if (words >= minimumWords) {
                    // faster array push
                    response[++index] = sentence;
                }
            }
        }

        return response;
    }

    function getSentenceFrequency(sentences, words) {
        if ({}.toString.call(sentences) !== '[object Array]') {
            return [];
        }

        var items = (words.tops.length) ? words.tops : words;
        sentences = sentences.slice(0);
        sentences.frequencies = {};

        for (var i = 0, j = sentences.length; i < j; i++) {
            var sentence = sentences[i];
            var sentenceLowered = sentence.toLowerCase();
            sentences.frequencies[sentence] = 0;

            for (var k = 0, l = items.length; k < l; k++) {
                if (sentenceLowered.indexOf(items[k]) > -1) {
                    sentences.frequencies[sentence]++;
                }
            }
        }

        // desc
        sentences.sort(function(a, b) { return sentences.frequencies[b] - sentences.frequencies[a] });

        return sentences;
    }

    function getWordFrequency(text) {
        var index = -1;
        var topIndex = -1;
        var words = [];
        words.frequencies = {};
        words.tops = [];

        text.toLowerCase().split(/[\s*\.*\,\;\+?\#\|:\-\/\\\[\]\(\)\{\}$%&0-9*]/).map(function(k, v) {
            if (k && k.length > 1) {
                words.frequencies[k]++ || (words.frequencies[k] = 1);
            }
        });

        for (var word in words.frequencies) {
            words[++index] = word;

            if (words.frequencies[word] > 1) {
                words.tops[++topIndex] = word;
            }
        }

        // desc
        words.sort(function(a, b) { return words.frequencies[b] - words.frequencies[a] });
        words.tops.sort(function(a, b) { return words.frequencies[b] - words.frequencies[a] });

        return words;
    }

    function removeNodes(nodes) {
        var type = {}.toString.call(nodes);

        if (type !== '[object Array]' && type !== '[object NodeList]') {
            return;
        }

        var index = -1;
        var length = nodes.length;

        while(++index < length) {
            var node = nodes[index];
            (node.parentNode || { removeChild: function() {} }).removeChild(node);
        }
    }

    function setDefinitions(input) {
        var definitions = [];
        var nodes = document.querySelectorAll(input.nodes.selector);

        if ({}.toString.call(nodes) !== '[object NodeList]') {
            input.definitions = definitions;
            return input;
        }

        var firsts = {};
        var hasField = false;
        var index = -1;
        var longestName = 0;
        var submit = { label: '', text: '' };
        var tags = document.getElementsByTagName('*');
        var texts = {};
        var unsets = {};
        var visibleOnly = (parseInt(input.nodes.visibility) === VISIBILITIES.VISIBLE);

        for (var i = 0, j = nodes.length; i < j; i++) {
            var buffer = { attribute: {}, operation: {} };
            var definition = {};
            var node = nodes[i];

            if ((visibleOnly && node.offsetHeight > 0) || !visibleOnly) {
                var action = '';
                var hasArgument = false;
                var hasUnset = false;
                var label = '';
                var text = node.textContent || node.innerText || '';

                if (node.id) {
                    buffer.attribute.strategy = 'id';
                    buffer.attribute.value = node.id;
                }
                else if (node.name) {
                    buffer.attribute.strategy = 'name';
                    buffer.attribute.value = node.name;
                }
                else {
                    buffer.attribute.strategy = 'css';
                    buffer.attribute.value = getCSSSelector(node);
                }

                buffer.sourceIndex = node.sourceIndex || [].indexOf.call(tags, node);

                switch(node.nodeName) {
                    case 'A':
                        if (text === '' && node.hasChildNodes()) {
                            for (var k = 0, l = node.childNodes.length; k < l; k++) {
                                var child = node.childNodes[k];

                                if (child.nodeName === 'IMG') {
                                    if (child.alt) {
                                        text = child.alt;
                                    }
                                    else if (child.src) {
                                        text = getFileName(child.src);
                                    }

                                    break;
                                }
                            }
                        }

                        action = 'Click';
                        label = 'Link';
                        buffer.type = 'link';

                        if (submit.text === '' && text.toLowerCase().indexOf('submit') > -1) {
                            submit.label = label;
                            submit.text = text;
                        }
                        break;
                    case 'BUTTON':
                        action = 'Click';
                        label = 'Button';
                        buffer.type = 'button';
                        var buttonType = node.getAttribute('type') || '';

                        if (submit.text === '' && (buttonType.toLowerCase() === 'submit' ||
                                text.toLowerCase().indexOf('submit') > -1)) {
                            submit.label = label;
                            submit.text = text;
                        }
                        break;
                    case 'INPUT':
                        var inputType = node.getAttribute('type') || '';
                        var inputTypeLowered = inputType.toLowerCase();

                        if ('|button|image|submit|'.indexOf('|' + inputTypeLowered + '|') > -1) {
                            action = 'Click';
                            label = 'Button';
                            buffer.type = 'button';

                            if (inputTypeLowered === 'submit') {
                                submit.label = label;
                                submit.text = text;
                            }
                            else if (submit.text === '' && text.toLowerCase().indexOf('submit') > -1) {
                                submit.label = label;
                                submit.text = text;
                            }
                        }
                        else {
                            if (inputTypeLowered === 'hidden') {
                                break;
                            }

                            if ('|password|radio|text|'.indexOf('|' + inputTypeLowered + '|') > -1) {
                                hasArgument = true;
                            }

                            if (inputTypeLowered === 'checkbox') {
                                hasUnset = true;
                            }

                            if (text === '') {
                                if (buffer.attribute.strategy === 'id') {
                                    var label = document.
                                        querySelector('label[for="' + buffer.attribute.value + '"]');
                                    if (label) {
                                        text = label.textContent || label.innerText || '';
                                    }
                                }
                                else {
                                    var parentNode = node.parentNode;
                                    if (parentNode) {
                                        text = parentNode.textContent || parentNode.innerText || '';
                                    }
                                }
                            }

                            label = getLetter(inputType, LETTERS.PROPER);

                            if (inputTypeLowered === 'radio') {
                                label = 'Radio Button';
                                if (buffer.attribute.strategy !== 'name' && node.name) {
                                    buffer.attribute.strategy = 'name';
                                    buffer.attribute.value = node.name;
                                }
                            }

                            action = 'Set';
                            buffer.type = inputType;
                        }
                        break;
                    case 'SELECT':
                        if (buffer.attribute.strategy === 'id') {
                            var label = document.
                                querySelector('label[for="' + buffer.attribute.value + '"]');
                            if (label) {
                                text = label.textContent || label.innerText || '';
                            }
                        }
                        else {
                            var parentNode = node.parentNode;
                            if (parentNode) {
                                text = parentNode.textContent || parentNode.innerText || '';
                            }
                        }

                        action = 'Set';
                        hasArgument = true;
                        hasUnset = true;
                        label = 'Drop Down List';
                        buffer.type = 'select';
                        break;
                }

                // up to 5 words
                text = text.split(/\s+/g).slice(0, 5).join(' ').
                    replace(/^\s+|\s+$|[\[\]():,!?]/g, '');

                if (text !== '') {
                    if (texts[text]) {
                        texts[text]++;

                        if (texts[text] === 2) {
                            var firstText = text + ' 1';

                            // need to adjust the first entry and make it as part of the group
                            definition = getDefinition({
                                action: action,
                                buffer: definitions[firsts[text]],
                                hasArgument: hasArgument,
                                label: label,
                                letters: {
                                    attribute: input.attributes.letter,
                                    operation: input.operations.letter
                                },
                                text: firstText
                            });

                            definitions[firsts[text]] = definition;

                            if (hasUnset) {
                                definition = getDefinition({
                                    action: action,
                                    buffer: definitions[unsets[text]],
                                    hasArgument: hasArgument,
                                    label: label,
                                    letters: {
                                        attribute: input.attributes.letter,
                                        operation: input.operations.letter
                                    },
                                    negate: hasUnset,
                                    text: firstText
                                });

                                definitions[unsets[text]] = definition;
                            }
                        }

                        text = text + ' ' + texts[text];
                    }
                    else {
                        firsts[text] = index + 1;
                        texts[text] = 1;

                        if (hasUnset) {
                            unsets[text] = index + 2;
                        }
                    }

                    definition = getDefinition({
                        action: action,
                        buffer: buffer,
                        hasArgument: hasArgument,
                        label: label,
                        letters: {
                            attribute: input.attributes.letter,
                            operation: input.operations.letter
                        },
                        text: text
                    });

                    // faster array push
                    definitions[++index] = definition;

                    var attributeNameLength = definition.attribute.name.length;
                    if (attributeNameLength > longestName) {
                        longestName = attributeNameLength;
                    }

                    if (hasUnset) {
                        definition = getDefinition({
                            action: action,
                            buffer: buffer,
                            hasArgument: hasArgument,
                            label: label,
                            letters: {
                                attribute: input.attributes.letter,
                                operation: input.operations.letter
                            },
                            negate: hasUnset,
                            text: text
                        });

                        // faster array push
                        definitions[++index] = definition;
                    }

                    if (!hasField && action === 'Set') {
                        hasField = true;
                    }
                }
            }
        }

        // operation extras
        if (hasField && input.operations.extras.fill) {
            var buffer = {
                attribute: {},
                operation: {
                    documentation: 'Fill every fields in the page.',
                    name: getLetter('Fill', input.operations.letter)
                },
                negate: true,
                sourceIndex: -1,
                type: 'fill'
            };

            // faster array push
            definitions[++index] = buffer;
        }

        if (hasField && submit.text !== '' && input.operations.extras['fill.submit']) {
            var buffer = {
                attribute: {},
                operation: {
                    documentation: 'Fill every fields in the page and submit it to target page.',
                    name: getLetter('Fill And Submit', input.operations.letter)
                },
                negate: true,
                sourceIndex: -1,
                target: {
                    modelName: input.model.target
                },
                type: 'fill.submit'
            };

            // faster array push
            definitions[++index] = buffer;
        }

        if (submit.text !== '' && input.operations.extras.submit) {
            var buffer = {
                attribute: {},
                operation: {
                    documentation: 'Submit the form to target page.',
                    name: getLetter('Submit', input.operations.letter)
                },
                negate: true,
                sourceIndex: -1,
                target: {
                    modelName: input.model.target,
                    name: getLetter('Click ' + submit.text + ' ' + submit.label, input.operations.letter)
                },
                type: 'submit'
            };

            // faster array push
            definitions[++index] = buffer;
        }

        if (input.operations.extras['verify.loaded']) {
            var sourceText = getPageVisibleHTML();
            sourceText = sourceText.replace(/(<([^>]+)>)/gi, '\n');
            var sentences = getSentences(sourceText);
            var words = getWordFrequency(sourceText);
            sentences = getSentenceFrequency(sentences, words);
            var value = sentences[0];

            var buffer = {
                attribute: {
                    name: getLetter('Page Loaded Text', input.attributes.letter),
                    value: value
                },
                operation: {
                    documentation: 'Verify that the page loaded completely.',
                    name: getLetter('Verify Page Loaded', input.operations.letter)
                },
                sourceIndex: -1,
                type: 'verify.loaded'
            };

            // faster array push
            definitions[++index] = buffer;
        }

        if (input.operations.extras['verify.url']) {
            var value = document.location.pathname;

            var buffer = {
                attribute: {
                    name: getLetter('Page Url', input.attributes.letter),
                    value: value
                },
                operation: {
                    documentation: 'Verify that current page URL matches the expected URL.',
                    name: getLetter('Verify Page Url', input.operations.letter)
                },
                sourceIndex: -1,
                type: 'verify.url'
            };

            // faster array push
            definitions[++index] = buffer;
        }

        input.attributes.longestName = longestName;

        input.definitions = definitions;
        return input;
    }

    // ========================================================================
    // POG namespace

    return {
        generate: function(input) {
            input = input || {};
            var output = Object.extend(input);

            output = common.setDefaultValues(output);
            output = setDefinitions(output);
            output.url = document.location.href;

            return output;
        },
        LETTERS: LETTERS,
        VISIBILITIES: VISIBILITIES
    };
})();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (!sender.tab && request.input) {
        sendResponse(POG.generate(request.input));
    }
});
