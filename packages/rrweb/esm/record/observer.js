"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var rrweb_snapshot_1 = require("@partial/rrweb-snapshot");
var utils_1 = require("../utils");
var types_1 = require("../types");
var collection_1 = require("./collection");
function initMutationObserver(cb, blockClass, inlineStylesheet) {
    var observer = new MutationObserver(function (mutations) {
        var texts = [];
        var attributes = [];
        var removes = [];
        var adds = [];
        var addsSet = new Set();
        var droppedSet = new Set();
        var genAdds = function (n) {
            if (utils_1.isBlocked(n, blockClass)) {
                return;
            }
            addsSet.add(n);
            droppedSet.delete(n);
            n.childNodes.forEach(function (childN) { return genAdds(childN); });
        };
        mutations.forEach(function (mutation) {
            var type = mutation.type, target = mutation.target, oldValue = mutation.oldValue, addedNodes = mutation.addedNodes, removedNodes = mutation.removedNodes, attributeName = mutation.attributeName;
            switch (type) {
                case 'characterData': {
                    var value = target.textContent;
                    if (!utils_1.isBlocked(target, blockClass) && value !== oldValue) {
                        texts.push({
                            value: value,
                            node: target,
                        });
                    }
                    break;
                }
                case 'attributes': {
                    var value = target.getAttribute(attributeName);
                    if (utils_1.isBlocked(target, blockClass) || value === oldValue) {
                        return;
                    }
                    var item = attributes.find(function (a) { return a.node === target; });
                    if (!item) {
                        item = {
                            node: target,
                            attributes: {},
                        };
                        attributes.push(item);
                    }
                    item.attributes[attributeName] = value;
                    break;
                }
                case 'childList': {
                    addedNodes.forEach(function (n) { return genAdds(n); });
                    removedNodes.forEach(function (n) {
                        var nodeId = utils_1.mirror.getId(n);
                        var parentId = utils_1.mirror.getId(target);
                        if (utils_1.isBlocked(n, blockClass)) {
                            return;
                        }
                        if (addsSet.has(n)) {
                            collection_1.deepDelete(addsSet, n);
                            droppedSet.add(n);
                        }
                        else if (addsSet.has(target) && nodeId === -1) {
                        }
                        else if (utils_1.isAncestorRemoved(target)) {
                        }
                        else {
                            removes.push({
                                parentId: parentId,
                                id: nodeId,
                            });
                        }
                        utils_1.mirror.removeNodeFromMap(n);
                    });
                    break;
                }
                default:
                    break;
            }
        });
        Array.from(addsSet).forEach(function (n) {
            if (!collection_1.isParentDropped(droppedSet, n) && !collection_1.isParentRemoved(removes, n)) {
                adds.push({
                    parentId: utils_1.mirror.getId(n.parentNode),
                    previousId: !n.previousSibling
                        ? n.previousSibling
                        : utils_1.mirror.getId(n.previousSibling),
                    nextId: !n.nextSibling
                        ? n.nextSibling
                        : utils_1.mirror.getId(n.nextSibling),
                    node: rrweb_snapshot_1.serializeNodeWithId(n, document, utils_1.mirror.map, blockClass, true),
                });
            }
            else {
                droppedSet.add(n);
            }
        });
        var payload = {
            texts: texts
                .map(function (text) { return ({
                id: utils_1.mirror.getId(text.node),
                value: text.value,
            }); })
                .filter(function (text) { return utils_1.mirror.has(text.id); }),
            attributes: attributes
                .map(function (attribute) { return ({
                id: utils_1.mirror.getId(attribute.node),
                attributes: attribute.attributes,
            }); })
                .filter(function (attribute) { return utils_1.mirror.has(attribute.id); }),
            removes: removes,
            adds: adds,
        };
        if (!payload.texts.length &&
            !payload.attributes.length &&
            !payload.removes.length &&
            !payload.adds.length) {
            return;
        }
        cb(payload);
    });
    observer.observe(document, {
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true,
        childList: true,
        subtree: true,
    });
    return observer;
}
function initMousemoveObserver(cb) {
    var positions = [];
    var timeBaseline;
    var wrappedCb = utils_1.throttle(function () {
        var totalOffset = Date.now() - timeBaseline;
        cb(positions.map(function (p) {
            p.timeOffset -= totalOffset;
            return p;
        }));
        positions = [];
        timeBaseline = null;
    }, 500);
    var updatePosition = utils_1.throttle(function (evt) {
        var clientX = evt.clientX, clientY = evt.clientY, target = evt.target;
        if (!timeBaseline) {
            timeBaseline = Date.now();
        }
        positions.push({
            x: clientX,
            y: clientY,
            id: utils_1.mirror.getId(target),
            timeOffset: Date.now() - timeBaseline,
        });
        wrappedCb();
    }, 50, {
        trailing: false,
    });
    return utils_1.on('mousemove', updatePosition);
}
function initMouseInteractionObserver(cb, blockClass) {
    var handlers = [];
    var getHandler = function (eventKey) {
        return function (event) {
            if (utils_1.isBlocked(event.target, blockClass)) {
                return;
            }
            var id = utils_1.mirror.getId(event.target);
            var clientX = event.clientX, clientY = event.clientY;
            cb({
                type: types_1.MouseInteractions[eventKey],
                id: id,
                x: clientX,
                y: clientY,
            });
        };
    };
    Object.keys(types_1.MouseInteractions)
        .filter(function (key) { return Number.isNaN(Number(key)); })
        .forEach(function (eventKey) {
        var eventName = eventKey.toLowerCase();
        var handler = getHandler(eventKey);
        handlers.push(utils_1.on(eventName, handler));
    });
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
function initScrollObserver(cb, blockClass) {
    var updatePosition = utils_1.throttle(function (evt) {
        if (!evt.target || utils_1.isBlocked(evt.target, blockClass)) {
            return;
        }
        var id = utils_1.mirror.getId(evt.target);
        if (evt.target === document) {
            var scrollEl = (document.scrollingElement || document.documentElement);
            cb({
                id: id,
                x: scrollEl.scrollLeft,
                y: scrollEl.scrollTop,
            });
        }
        else {
            cb({
                id: id,
                x: evt.target.scrollLeft,
                y: evt.target.scrollTop,
            });
        }
    }, 100);
    return utils_1.on('scroll', updatePosition);
}
function initViewportResizeObserver(cb) {
    var updateDimension = utils_1.throttle(function () {
        var height = utils_1.getWindowHeight();
        var width = utils_1.getWindowWidth();
        cb({
            width: Number(width),
            height: Number(height),
        });
    }, 200);
    return utils_1.on('resize', updateDimension, window);
}
var INPUT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
var lastInputValueMap = new WeakMap();
function initInputObserver(cb, blockClass, ignoreClass) {
    function eventHandler(event) {
        var target = event.target;
        if (!target ||
            !target.tagName ||
            INPUT_TAGS.indexOf(target.tagName) < 0 ||
            utils_1.isBlocked(target, blockClass)) {
            return;
        }
        var type = target.type;
        if (type === 'password' ||
            target.classList.contains(ignoreClass)) {
            return;
        }
        var text = target.value;
        var isChecked = false;
        if (type === 'radio' || type === 'checkbox') {
            isChecked = target.checked;
        }
        cbWithDedup(target, { text: text, isChecked: isChecked });
        var name = target.name;
        if (type === 'radio' && name && isChecked) {
            document
                .querySelectorAll("input[type=\"radio\"][name=\"" + name + "\"]")
                .forEach(function (el) {
                if (el !== target) {
                    cbWithDedup(el, {
                        text: el.value,
                        isChecked: !isChecked,
                    });
                }
            });
        }
    }
    function cbWithDedup(target, v) {
        var lastInputValue = lastInputValueMap.get(target);
        if (!lastInputValue ||
            lastInputValue.text !== v.text ||
            lastInputValue.isChecked !== v.isChecked) {
            lastInputValueMap.set(target, v);
            var id = utils_1.mirror.getId(target);
            cb(__assign({}, v, { id: id }));
        }
    }
    var handlers = [
        'input',
        'change',
    ].map(function (eventName) { return utils_1.on(eventName, eventHandler); });
    var propertyDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    var hookProperties = [
        [HTMLInputElement.prototype, 'value'],
        [HTMLInputElement.prototype, 'checked'],
        [HTMLSelectElement.prototype, 'value'],
        [HTMLTextAreaElement.prototype, 'value'],
    ];
    if (propertyDescriptor && propertyDescriptor.set) {
        handlers.push.apply(handlers, hookProperties.map(function (p) {
            return utils_1.hookSetter(p[0], p[1], {
                set: function () {
                    eventHandler({ target: this });
                },
            });
        }));
    }
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
function initObservers(o) {
    var mutationObserver = initMutationObserver(o.mutationCb, o.blockClass, o.inlineStylesheet);
    var mousemoveHandler = initMousemoveObserver(o.mousemoveCb);
    var mouseInteractionHandler = initMouseInteractionObserver(o.mouseInteractionCb, o.blockClass);
    var scrollHandler = initScrollObserver(o.scrollCb, o.blockClass);
    var viewportResizeHandler = initViewportResizeObserver(o.viewportResizeCb);
    var inputHandler = initInputObserver(o.inputCb, o.blockClass, o.ignoreClass);
    return function () {
        mutationObserver.disconnect();
        mousemoveHandler();
        mouseInteractionHandler();
        scrollHandler();
        viewportResizeHandler();
        inputHandler();
    };
}
exports.default = initObservers;
//# sourceMappingURL=observer.js.map