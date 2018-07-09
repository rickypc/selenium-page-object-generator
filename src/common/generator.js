window.POGLoaded = !!window.POG;
window.POG = (function () {
    // to compartment any js error on the page
    var ELEMENT_NODE = 1;
    var NG_PREFIXES = ['ng-', 'data-ng-', 'ng_', 'x-ng-', 'ng\\:'];
    var NG_STRATEGIES = [{handler: getNgModelName, strategy: 'model'}];
    var SHOW_COMMENT = 128;

    // ========================================================================
    // private functions

    function getAttributeSelector(name, node) {
        var response = '';
        var value = node.getAttribute(name);

        if (value) {
            var selector = node.nodeName.toLowerCase();
            if (name === 'class') {
                selector += '.' + value.trim().split(/\s+/g).join('.');
            }
            else {
                value = value.replace(/\r?\n|\r/g, '');
                selector += '[' + name + '=\'' + value + '\']';
            }
            try {
                var elements = document.querySelectorAll(selector);
                if (elements.length === 1) {
                    response = selector;
                }
            } catch (ex) {
                // bad selector. skipping.
            }
        }

        return response;
    }

    function getClosestSibling(node, siblings) {
        var copies = [].slice.call(siblings);
        copies.unshift(node);
        var copiesLength = copies.length;
        var closest = 1;

        if (closest > copiesLength) {
            closest = 0;
        }

        var nodeIndex = 0;
        var siblingIndex = closest;

        for (var i = 0; i < copiesLength; i++) {
            var delta = Math.abs(nodeIndex - i);

            if (delta > closest) {
                closest = delta;
                siblingIndex = i;
            }
        }

        return (siblingIndex === 0) ? null : copies[siblingIndex];
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

            if (node && node.id) {
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
                            currentSelector += '[data-type=\'' +
                                node.getAttribute('data-type') + '\']';
                        }
                    }
                }

                selector = currentSelector + ' ' + selector;
            }
        }

        return selector.replace(/^html[^\b]*\bbody\b/, '').trim();
    }

    function getValidVariableName(name) {
        if (name.length && !/[$_a-zA-Z]/.test(name[0])) {
            return '_' + name;
        }
        return name;
    }

    /**
     * Build a definition
     *
     * For a given element, we create attribute and relevant methods based on the element type
     *
     * @param {Associative Array} input
     *
     * Element properties
     *
     * @return {Associative Array} buffer
     *   Object that contains the attribute name (Object.attribute.name), the method name (Object.operation.name)
     *   documentation for each method (buffer.operation.documentation) based on the element type
     *
     * In order to build the method documentation we use "action" key
     * In order to build the method name we use "label" key
     *
     */
    function getDefinition(input) {
        input = input || {};
        var actionLowered = input.action.toLowerCase();
        var buffer = Object.extend(input.buffer);
        // deep copy
        buffer.attribute = Object.extend(buffer.attribute);
        buffer.operation = Object.extend(buffer.operation);

        // Based on action type use the following suffixes to the documentation and method name
        var suffixes = {
            action: (actionLowered === 'click') ? ' on' : '',
            label: (actionLowered === 'set') ? ' Field' : (actionLowered === 'see') ? ' visible?' : ''
        };
        suffixes.documentation = ' ' + getLetter(input.fullText || input.text, LETTERS.NATURAL) +
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

        buffer.attribute.name = getValidVariableName(getLetter(input.text, input.letters.attribute));
        buffer.operation.documentation = input.action + suffixes.action +
            suffixes.documentation;
        //If the action is "see" we want to create a method with suffix "_visible?" so we don't put the action in the method name
        buffer.operation.name = (actionLowered === 'see')
            ? getLetter(suffixes.name,
                input.letters.operation, suffixes.name)
            : getLetter(input.action + suffixes.name,
                input.letters.operation, input.action);
        return buffer;
    }

    function getFileName(path) {
        return path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
    }

    function getHiddens(cloned, original) {
        var clones = cloned.getElementsByTagName('*');
        var originals = original.getElementsByTagName('*');
        var hiddens = (cloned) ? Array.filter(cloned.querySelectorAll(
            '*:not(br):not(img):not(input):not(link):not(option):not(script):not(select):not(style)'
        ), function (item, index) {
            var sourceIndex = [].indexOf.call(clones, item);
            return originals[sourceIndex].offsetHeight < 1 || !isElementInViewport(item);
        }) : [];
        return hiddens;
    }

    function getLabelText(node) {
        var text = '';

        if (node && node.id) {
            text = getLabelTextFor(node, 'id');
        }

        if (text === '' && node && node.name) {
            // non-standard, but it happens
            text = getLabelTextFor(node, 'name');
        }

        if (text === '') {
            // find label from siblings
            // TODO: should use more aggressive collector
            var labels = (node && node.parentNode) ?
                node.parentNode.querySelectorAll('label') : [];
            var label = getClosestSibling(node, labels);

            if (label) {
                text = label.textContent || label.innerText || '';
                text = text.trim();
            }
        }

        return text;
    }

    function getLabelTextFor(node, attribute) {
        var identifier = node.getAttribute(attribute) || node[attribute] || '';
        var text = '';

        if (identifier) {
            var label = document.querySelector('label[for="' + identifier + '"]');

            if (label) {
                text = label.textContent || label.innerText || '';
                text = text.trim();
            }

            if (text === '') {
                var identifierLowered = identifier.toLowerCase();
                var labels = Array.filter(document.querySelectorAll('label[for]'), function (item) {
                    return item.getAttribute('for').toLowerCase() === identifierLowered;
                });

                label = getClosestSibling(node, labels);

                if (label) {
                    text = label.textContent || label.innerText || '';
                    text = text.trim();
                }
            }
        }

        return text;
    }

    function getLetter(value, type, action) {
        action = action || '';
        type = type || LETTERS.CAMEL;
        type = parseInt(type);
        value = value || '';

        if (type !== LETTERS.NATURAL) {
            // move number prefix to the end of the value
            var oldValue = value.replace(action, '').trim();
            var numberPrefix = /^([\d.]+)/.exec(oldValue);
            if (numberPrefix) {
                value = value.replace(numberPrefix[0], '') + ' ' + numberPrefix[0];
            }
        }

        switch (type) {
            case LETTERS.LOWER:
            case LETTERS.UPPER:
                value = value.replace(/\./g, '_').replace(/\s+|__/g, '_').replace(/^_|_$/g, '');
                value = (type === LETTERS.LOWER) ? value.toLowerCase() : value.toUpperCase();
                break;
            case LETTERS.CAMEL:
            case LETTERS.PROPER:
                value = value.replace(/\./g, ' ').trim().replace(/\s\s+/g, ' ').replace(/\w\S*/g, function (word) {
                    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
                }).replace(/\s+/g, '');
                if (type === LETTERS.CAMEL) {
                    value = value.charAt(0).toLowerCase() + value.substr(1);
                }
                break;
            case LETTERS.NATURAL:
                value = value.trim().replace(/\s\s+/g, ' ').replace(/\w\S*/g, function (word) {
                    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
                });
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

    /**
     * Get the Element locator
     *
     * For a given element, we extract the element locator based on angular attribute, custom attribute or regular
     * HTML attributes (id, name, css etc.)
     *
     * @param {HTML Element} node
     * @param {Boolean} angular
     * @param {String} customAttribute
     *
     * @return {Associative Array} response
     *   Object that contains the attribute type (Object.strategy) and the attribute value (response.value)
     *
     */
    function getLocator(node, angular, customAttribute) {
        var response = {};

        if (angular) {
            response = getNgLocator(node);
        }

        if (!response.strategy) {
            if (customAttribute && node.getAttribute(customAttribute)) {
                response.strategy = customAttribute.replace("-","_");
                response.value = node.getAttribute(customAttribute);
            }
            else if (node.id) {
                response.strategy = 'id';
                response.value = node.id;
            }
            else if (node.name) {
                response.strategy = 'name';
                response.value = node.name;
            }
            else {
                response.strategy = 'css';

                if (node.getAttribute('class')) {
                    response.value = getAttributeSelector('class', node);
                }

                if (!response.value && node.title) {
                    response.value = getAttributeSelector('title', node);
                }

                if (!response.value && node.getAttribute('href')) {
                    response.value = getAttributeSelector('href', node);
                }

                if (!response.value) {
                    response.value = getCSSSelector(node);
                }
            }
        }

        return response;
    }

    function getLongestName(name, longest) {
        name = name || '';
        var length = name.length;

        if (length > longest) {
            longest = length;
        }

        return longest;
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

        var siblings = (node && node.parentNode) ?
            Array.filter(node.parentNode.children, function (item, index) {
                return item.nodeName === nodeName;
            }) : [];

        var index = [].indexOf.call(siblings, node);
        // convert to 1-based index
        index++;

        return (index === 1 && index === siblings.length) ? 0 : index;
    }

    function getNodeText(node) {
        var text = getLabelText(node);

        if (text === '') {
            var parentNode = (node) ? node.parentNode : null;

            if (parentNode) {
                var clonedParentNode = parentNode.cloneNode(true);
                var clonedNode = clonedParentNode.querySelector(
                    node.nodeName.toLowerCase());
                clonedNode.parentNode.removeChild(clonedNode);
                clonedParentNode = sanitizeNode(clonedParentNode, parentNode);

                text = clonedParentNode.textContent || clonedParentNode.innerText || '';
                text = getSentences(text.trim())[0] || '';
            }
        }

        if (text === '') {
            text = (node) ? getNodeText(node.parentNode) : '';
        }

        return text;
    }

    function getPageVisibleHTML(original) {
        original = original || document.body;
        var cloned = original.cloneNode(true);
        cloned = sanitizeNode(cloned, original);
        return cloned.outerHTML;
    }

    function getSanitizedText(text, max) {
        var texts = (text || '').split(/\s+/g);

        if (max) {
            texts = texts.slice(0, max);
        }

        return texts.join(' ').trim().replace(/[^a-zA-Z0-9\. ]/g, '');
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
        sentences.sort(function (a, b) {
            return sentences.frequencies[b] - sentences.frequencies[a];
        });

        return sentences;
    }

    function getWordFrequency(text) {
        var index = -1;
        var topIndex = -1;
        var words = [];
        words.frequencies = {};
        words.tops = [];

        text.toLowerCase().split(/[\s*\.*\,\;\+?\#\|:\-\/\\\[\]\(\)\{\}$%&0-9*]/).map(function (k, v) {
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
        words.sort(function (a, b) {
            return words.frequencies[b] - words.frequencies[a];
        });
        words.tops.sort(function (a, b) {
            return words.frequencies[b] - words.frequencies[a];
        });

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

        if (type !== '[object Array]' &&
            !(type === '[object NodeList]' || type === '[object Object]')) {
            return;
        }

        var index = -1;
        var length = nodes.length;

        while (++index < length) {
            var node = nodes[index];
            if (node) {
                (node.parentNode || {
                    removeChild: function () {
                    }
                }).removeChild(node);
            }
        }
    }

    function sanitizeNode(clonedNode, originalNode) {
        var comments = getComments(clonedNode);
        var excludes = (clonedNode) ?
            clonedNode.querySelectorAll('img,input,link,option,script,select,style') : [];
        var hiddens = getHiddens(clonedNode, originalNode);
        removeNodes(comments);
        removeNodes(excludes);
        var excludedNode = clonedNode.cloneNode(true);
        removeNodes(hiddens);
        // ng:view template doesn't have height,
        // hence it will considered as hidden
        if ((clonedNode.textContent || '').trim() === '') {
            clonedNode = excludedNode;
        }
        return clonedNode;
    }

    /**
     * Create the Page Object content
     *
     * Based on a given options, it extract all the relevant data from the page and creates
     * the page object file content
     *
     * @param {Associative Array} input
     *
     * Object that contains chosen options by the user
     *
     * @return {Associative Array} input
     *   Object that contains the Page Object content
     *
     */
    function setDefinitions(input) {
        var definitions = [];
        var root = document.querySelector(input.nodes.root) || document;
        // nodes contains all the elements we find on the page that fit our options selection
        var nodes = (root) ? root.querySelectorAll(input.nodes.selector) : [];
        var type = {}.toString.call(nodes);

        if (!(type === '[object NodeList]' || type === '[object Object]')) {
            input.definitions = definitions;
            return input;
        }

        var firsts = {};
        var hasField = false;
        var index = -1;
        var longestName = 0;
        var submit = {label: '', text: ''};
        var tags = document.getElementsByTagName('*');
        var texts = {};
        var unsets = {};
        var visibleOnly = (parseInt(input.nodes.visibility) === VISIBILITIES.VISIBLE);

        // for each element we found on the page do the following
        for (var i = 0, j = nodes.length; i < j; i++) {
            var buffer = {attribute: {}, operation: {}};
            var definition = {};
            var node = nodes[i];

            if ((visibleOnly && node.offsetHeight > 0) || !visibleOnly) {
                var action = '';
                var hasArgument = false;
                var hasUnset = false;
                var label = '';
                // If the user entered a custom attribute, try to look for this attribute on the element
                var locator = (input.attributes.customAttribute !== '')
                    ? getLocator(node, input.nodes.angular, input.attributes.customAttribute)
                    : getLocator(node, input.nodes.angular);
                var text = node.textContent || node.innerText || '';

                //locator.strategy is the attribute of the element
                buffer.attribute.strategy = locator.strategy;
                //locator.value is the value of this attribute
                buffer.attribute.value = locator.value;
                buffer.sourceIndex = node.sourceIndex || [].indexOf.call(tags, node);

                /*
                Switch case which determine the element page object format:
                - node.nodeName is the element type (A, BUTTON, DIV etc.)
                - action will determine which method we will create for each Page Object
                - label will add a word to the end of the method name
                - text will effect the Page Object name (if nameFormat is true we will use the element inner text
                  to set the name, if not, we will use the attribute value.
                 */
                switch (node.nodeName) {
                    case 'A':
                        action = 'Click';
                        buffer.type = 'link';
                        label = '';
                        text = ((input.attributes.nameFormat === true) ? text || getLinkText(node) : locator.value).toLowerCase();

                        if (submit.text === '' && text.toLowerCase().indexOf('submit') > -1) {
                            submit.label = label;
                            submit.text = text;
                        }
                        break;
                    case 'BUTTON':
                        action = 'Click';
                        buffer.type = 'button';
                        label = '';

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
                            text = ((input.attributes.nameFormat === true) ? text || node.value || getNodeText(node) : locator.value).toLowerCase();


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
                            else if ('|email|number|password|radio|search|tel|text|url|'.indexOf('|' + inputType + '|') > -1) {
                                hasArgument = true;
                            }

                            label = getLetter(inputType, LETTERS.PROPER);
                            text = ((input.attributes.nameFormat === true) ? text || getNodeText(node) : locator.value).toLowerCase();

                            if (inputType === 'radio') {
                                label = 'Radio Button';
                                if (buffer.attribute.strategy !== 'name' && node.name) {
                                    buffer.attribute.strategy = 'name';
                                    buffer.attribute.value = node.name;
                                }

                                var radioValueBuffer = {
                                    attribute: {
                                        name: getLetter(getSanitizedText(text, 6) + ' Value',
                                            input.attributes.letter),
                                        value: node.value
                                    },
                                    operation: {},
                                    sourceIndex: -1,
                                    type: 'radio.value'
                                };

                                // faster array push
                                definitions[++index] = radioValueBuffer;

                                longestName = getLongestName(radioValueBuffer.attribute.name,
                                    longestName);
                            }

                            if ('|email|number|password|search|tel|url|'.indexOf('|' + inputType + '|') > -1) {
                                inputType = 'text';
                            }

                            action = 'Set';
                            buffer.type = inputType;
                        }
                        break;
                    case 'SELECT':
                        action = 'Set';
                        buffer.type = 'select';
                        hasArgument = true;
                        hasUnset = true;
                        label = 'Drop Down List';
                        text = ((input.attributes.nameFormat === true) ? getNodeText(node) : locator.value).toLowerCase();
                        break;
                    case 'TEXTAREA':
                        action = 'Set';
                        buffer.type = 'text';
                        hasArgument = true;
                        label = 'Textarea';
                        text = ((input.attributes.nameFormat === true) ? getNodeText(node) : locator.value).toLowerCase();
                        break;
                    case 'DIV':
                        action = 'See';
                        buffer.type = 'div';
                        label = '';
                        text = ((input.attributes.nameFormat === true) ? getNodeText(node) : locator.value).toLowerCase();
                        break;
                    case 'SPAN':
                        action = 'See';
                        buffer.type = 'span';
                        label = '';
                        text = ((input.attributes.nameFormat === true) ? getNodeText(node) : locator.value).toLowerCase();
                        break;
                }

                var fullText = (input.attributes.nameFormat === true) ? getSanitizedText(text) : text;
                text = (input.attributes.nameFormat === true) ? getSanitizedText(text, 6) : text;

                if (text !== '') {
                    /*
                    if we already have an attribute with the same name, so we need to add a number to the
                     name and change the index to make it unique.
                     */
                    if (texts[text]) {
                        texts[text]++;

                        if (texts[text] === 2) {
                            var firstText = text + ' 1';

                            // need to adjust the first entry and make it as part of the group
                            definition = getDefinition({
                                action: action,
                                buffer: definitions[firsts[text]],
                                fullText: fullText,
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
                                    fullText: fullText,
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
                        buffer.attribute.index = texts[text] - 1;
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
                        fullText: fullText,
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

                    longestName = getLongestName(definition.attribute.name, longestName);

                    if (hasUnset) {
                        definition = getDefinition({
                            action: action,
                            buffer: buffer,
                            fullText: fullText,
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
                    name: getLetter('Click ' + getSanitizedText(submit.text) + ' ' +
                        submit.label, input.operations.letter)
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
            var sentence = sentences[0] || '';

            // !robot
            if (input.attributes.letter !== LETTERS.LOWER && input.attributes.indent !== 1 &&
                input.attributes.separator !== '') {
                sentence = sentence.replace(/"/g, '\\"');
            }

            var buffer = {
                attribute: {
                    name: getLetter('Page Loaded Text', input.attributes.letter),
                    value: sentence
                },
                operation: {
                    documentation: 'Verify that the page loaded completely.',
                    name: getLetter('loaded?', input.operations.letter)
                },
                sourceIndex: -1,
                type: 'verify.loaded'
            };

            // faster array push
            definitions[++index] = buffer;
        }

        if (input.operations.extras['verify.url']) {
            // it's better to generate more information than less
            var uri = location.href.replace(document.location.origin, '');

            var buffer = {
                attribute: {
                    name: getLetter('Page Url', input.attributes.letter),
                    value: uri
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
        generate: function (input) {
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

if (!window.POGLoaded) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (!sender.tab && request.input) {
            sendResponse(POG.generate(request.input));
        }
    });
}
