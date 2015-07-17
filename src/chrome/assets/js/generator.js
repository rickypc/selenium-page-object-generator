window.POG=(function() {
    // to compartment any js error on the page
    var ELEMENT_NODE = 1;
    var NG_PREFIXES = ['ng-','data-ng-','ng_','x-ng-','ng\\:'];
    var NG_STRATEGIES = [ { handler: getNgModelName, strategy: 'model' } ];
    var SHOW_COMMENT = 128;

    // ========================================================================
    // private functions

    function getClosestSibling(node, siblings) {
        var copies = siblings.slice(0);
        copies.push(node);
        var closest = copies.length - 1;
        var nodeIndex = [].indexOf.call(copies, node);
        var siblingIndex = closest;

        for (var i = 0, j = copies.length; i < j; i++) {
            var delta = Math.abs(nodeIndex - i);

            if (delta < closest) {
                closest = delta;
                siblingIndex = i;
            }
        }

        return (siblingIndex === (copies.length - 1)) ? null : copies[siblingIndex];
    }

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

                if (index > 0) {
                    // it has siblings
                    currentSelector += ':nth-of-type(' + index + ')';
                }
                else {
                    if (node.className !== '') {
                        currentSelector += '.' + node.className.split(/\s+/g).join('.');
                    }

                    if (nodeName === 'INPUT') {
                        if (node.getAttribute('type')) {
                            currentSelector += '[type=\'' + node.type + '\']';
                        }
                        else if (node.getAttribute('data-type')) {
                            currentSelector += '[data-type=\'' + node.getAttribute('data-type') + '\']';
                        }
                    }
                }

                selector = currentSelector + ' ' + selector;
            }
        }

        return selector.replace(/^html[^\b]*\bbody\b/, '').trim();
    }

    function getDefinition(input) {
        input = input || {};
        var actionLowered = input.action.toLowerCase();
        var buffer = Object.extend(input.buffer);
        // deep copy
        buffer.attribute = Object.extend(buffer.attribute);
        buffer.operation = Object.extend(buffer.operation);
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
            function(item, index) {
                var sourceIndex = [].indexOf.call(clones, item);
                return originals[sourceIndex].offsetHeight < 1 ||
                    !isElementInViewport(item);
            });
        return hiddens;
    }

    function getLabelText(node) {
        var label = null;
        var text = '';

        if (node.id) {
            text = getLabelTextFor(node.id);
        }

        if (text === '' && node.name) {
            // non-standard, but it happens
            text = getLabelTextFor(node.name);
        }

        if (text === '') {
            // find label from siblings
            // TODO: should use more aggressive collector
            labels = Array.filter([].slice.call(node.parentNode.children),
                function(item, index) {
                    return item.nodeName === 'LABEL';
                });

            var label = getClosestSibling(node, labels);

            if (label) {
                text = label.textContent || label.innerText || '';
                text = text.trim();
            }
        }

        return text;
    }

    function getLabelTextFor(identifier) {
        var label = null;
        var text = '';

        if (identifier) {
            label = document.querySelector('label[for="' + identifier + '"]');

            if (label) {
                text = label.textContent || label.innerText || '';
                text = text.trim();
            }
        }

        return text;
    }

    function getLetter(value, type) {
        type = type || LETTERS.CAMEL;
        type = parseInt(type);
        value = value || '';

        switch (type) {
            case LETTERS.LOWER:
            case LETTERS.UPPER:
                value = value.replace(/\./g, '_').replace(/\s+|__/g, '_').replace(/^_|_$/g, '');
                value = (type === LETTERS.LOWER) ? value.toLowerCase() : value.toUpperCase();
                break;
            case LETTERS.CAMEL:
            case LETTERS.NATURAL:
            case LETTERS.PROPER:
                value = value.replace(/\./g, ' ').trim().replace(/\s\s+/g, ' ').
                    replace(/\w\S*/g, function(word) {
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

    function getLinkText(node) {
        var image = node.querySelector('img');
        var text = '';

        if (image) {
            text = image.alt || getFileName(image.src);
        }

        return text.trim();
    }

    function getLocator(node, angular) {
        var response = {};

        if (angular) {
            response = getNgLocator(node);
        }

        if (!response.strategy) {
            if (node.id) {
                response.strategy = 'id';
                response.value = node.id;
            }
            else if (node.name) {
                response.strategy = 'name';
                response.value = node.name;
            }
            else {
                response.strategy = 'css';
                response.value = getCSSSelector(node);
            }
        }

        return response;
    }

    function getNgLocator(node) {
        var response = {};

        for (var i = 0, j = NG_STRATEGIES.length; i < j; i++) {
            var item = NG_STRATEGIES[i];
            var value = item.handler(node);

            if (value) {
                response.strategy = item.strategy;
                response.value = value;
            }
        }

        return response;
    }

    function getNgModelName(node) {
        var name = '';

        for (var i = 0, j = NG_PREFIXES.length; i < j; i++) {
            name = node.getAttribute(NG_PREFIXES[i] + 'model') || '';

            if (name) {
                break;
            }
        }

        return name.trim();
    }

    function getNodeIndex(node, nodeName) {
        nodeName = nodeName || node.nodeName;

        var siblings = Array.filter(node.parentNode.children, function(item, index) {
            return item.nodeName === nodeName;
        });

        var index = [].indexOf.call(siblings, node);
        // convert to 1-based index
        index++;

        return (index === 1 && index === siblings.length) ? 0 : index;
    }

    function getNodeText(node) {
        var text = getLabelText(node);

        if (text === '') {
            var parentNode = node.parentNode;

            if (parentNode) {
                var clonedParentNode = parentNode.cloneNode(true);
                var clonedNode = clonedParentNode.querySelector(
                    node.nodeName.toLowerCase());
                clonedParentNode.removeChild(clonedNode);

                text = clonedParentNode.textContent || clonedParentNode.innerText || '';
                text = text.trim();
            }
        }

        if (text === '') {
            text = getNodeText(node.parentNode);
        }

        return text;
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
            var sentence = sentences[i].trim();

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

    function isElementInViewport(el) {
        if (typeof(jQuery) !== 'undefined' && el instanceof jQuery) {
            el = el[0];
        }

        var rect = el.getBoundingClientRect();
        var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
        var windowWidth = (window.innerWidth || document.documentElement.clientWidth);

        return ((rect.left > -1) && (rect.top > -1) &&
            ((rect.left + rect.width) <= windowWidth) &&
            ((rect.top + rect.height) <= windowHeight));
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
        var root = document.querySelector(input.nodes.root) || document;
        var nodes = root.querySelectorAll(input.nodes.selector);

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
                var locator = getLocator(node, input.nodes.angular);
                var text = node.textContent || node.innerText || '';

                buffer.attribute.strategy = locator.strategy;
                buffer.attribute.value = locator.value;
                buffer.sourceIndex = node.sourceIndex || [].indexOf.call(tags, node);

                switch(node.nodeName) {
                    case 'A':
                        action = 'Click';
                        buffer.type = 'link';
                        label = 'Link';
                        text = text || getLinkText(node);

                        if (submit.text === '' && text.toLowerCase().indexOf('submit') > -1) {
                            submit.label = label;
                            submit.text = text;
                        }
                        break;
                    case 'BUTTON':
                        action = 'Click';
                        buffer.type = 'button';
                        label = 'Button';

                        if (submit.text === '' && ((node.type || '').toLowerCase() === 'submit' ||
                                text.toLowerCase().indexOf('submit') > -1)) {
                            submit.label = label;
                            submit.text = text;
                        }
                        break;
                    case 'INPUT':
                        var inputType = node.type || '';

                        if ('|button|image|submit|'.indexOf('|' + inputType + '|') > -1) {
                            action = 'Click';
                            buffer.type = 'button';
                            label = 'Button';
                            text = text || node.value || getNodeText(node);

                            if (inputType === 'submit') {
                                submit.label = label;
                                submit.text = text;
                            }
                            else if (submit.text === '' && text.toLowerCase().indexOf('submit') > -1) {
                                submit.label = label;
                                submit.text = text;
                            }
                        }
                        else {
                            if (inputType === 'hidden') {
                                break;
                            }
                            else if (inputType === 'checkbox') {
                                hasUnset = true;
                            }
                            else if ('|email|number|password|radio|search|tel|text|url|'.
                                    indexOf('|' + inputType + '|') > -1) {
                                hasArgument = true;
                            }

                            label = getLetter(inputType, LETTERS.PROPER);

                            if (inputType === 'radio') {
                                label = 'Radio Button';
                                if (buffer.attribute.strategy !== 'name' && node.name) {
                                    buffer.attribute.strategy = 'name';
                                    buffer.attribute.value = node.name;
                                }
                            }

                            if ('|email|number|password|search|tel|url|'.
                                    indexOf('|' + inputType + '|') > -1) {
                                inputType = 'text';
                            }

                            action = 'Set';
                            buffer.type = inputType;
                            text = text || getNodeText(node);
                        }
                        break;
                    case 'SELECT':
                        action = 'Set';
                        buffer.type = 'select';
                        hasArgument = true;
                        hasUnset = true;
                        label = 'Drop Down List';
                        text = getNodeText(node);
                        break;
                    case 'TEXTAREA':
                        action = 'Set';
                        buffer.type = 'text';
                        hasArgument = true;
                        label = 'Textarea';
                        text = getNodeText(node);
                        break;
                }

                // up to 5 words
                text = text.split(/\s+/g).slice(0, 5).join(' ').trim().replace(/[^a-zA-Z0-9\. ]/g, '');

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
            // it's better to generate more information than less
            var value = document.location.href.replace(document.location.origin, '');

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
