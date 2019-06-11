import * as tslib_1 from "tslib";
import { serializeNodeWithId } from '@partial/rrweb-snapshot';
import { mirror, throttle, on, hookSetter, getWindowHeight, getWindowWidth, isBlocked, isAncestorRemoved, } from '../utils';
import { MouseInteractions, } from '../types';
import { deepDelete, isParentRemoved, isParentDropped } from './collection';
/**
 * Mutation observer will merge several mutations into an array and pass
 * it to the callback function, this may make tracing added nodes hard.
 * For example, if we append an element el_1 into body, and then append
 * another element el_2 into el_1, these two mutations may be passed to the
 * callback function together when the two operations were done.
 * Generally we need trace child nodes of newly added node, but in this
 * case if we count el_2 as el_1's child node in the first mutation record,
 * then we will count el_2 again in the secoond mutation record which was
 * duplicated.
 * To avoid of duplicate counting added nodes, we will use a Set to store
 * added nodes and its child nodes during iterate mutation records. Then
 * collect added nodes from the Set which will has no duplicate copy. But
 * this also cause newly added node will not be serialized with id ASAP,
 * which means all the id related calculation should be lazy too.
 * @param cb mutationCallBack
 */
function initMutationObserver(cb, blockClass, inlineStylesheet) {
    var observer = new MutationObserver(function (mutations) {
        var texts = [];
        var attributes = [];
        var removes = [];
        var adds = [];
        var addsSet = new Set();
        var droppedSet = new Set();
        var genAdds = function (n) {
            if (isBlocked(n, blockClass)) {
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
                    if (!isBlocked(target, blockClass) && value !== oldValue) {
                        texts.push({
                            value: value,
                            node: target,
                        });
                    }
                    break;
                }
                case 'attributes': {
                    var value = target.getAttribute(attributeName);
                    if (isBlocked(target, blockClass) || value === oldValue) {
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
                    // overwrite attribute if the mutations was triggered in same time
                    item.attributes[attributeName] = value;
                    break;
                }
                case 'childList': {
                    addedNodes.forEach(function (n) { return genAdds(n); });
                    removedNodes.forEach(function (n) {
                        var nodeId = mirror.getId(n);
                        var parentId = mirror.getId(target);
                        if (isBlocked(n, blockClass)) {
                            return;
                        }
                        // removed node has not been serialized yet, just remove it from the Set
                        if (addsSet.has(n)) {
                            deepDelete(addsSet, n);
                            droppedSet.add(n);
                        }
                        else if (addsSet.has(target) && nodeId === -1) {
                            /**
                             * If target was newly added and removed child node was
                             * not serialized, it means the child node has been removed
                             * before callback fired, so we can ignore it.
                             * TODO: verify this
                             */
                        }
                        else if (isAncestorRemoved(target)) {
                            /**
                             * If parent id was not in the mirror map any more, it
                             * means the parent node has already been removed. So
                             * the node is also removed which we do not need to track
                             * and replay.
                             */
                        }
                        else {
                            removes.push({
                                parentId: parentId,
                                id: nodeId,
                            });
                        }
                        mirror.removeNodeFromMap(n);
                    });
                    break;
                }
                default:
                    break;
            }
        });
        Array.from(addsSet).forEach(function (n) {
            if (!isParentDropped(droppedSet, n) && !isParentRemoved(removes, n)) {
                adds.push({
                    parentId: mirror.getId(n.parentNode),
                    previousId: !n.previousSibling
                        ? n.previousSibling
                        : mirror.getId(n.previousSibling),
                    nextId: !n.nextSibling
                        ? n.nextSibling
                        : mirror.getId(n.nextSibling),
                    node: serializeNodeWithId(n, document, mirror.map, blockClass, true),
                });
            }
            else {
                droppedSet.add(n);
            }
        });
        var payload = {
            texts: texts
                .map(function (text) { return ({
                id: mirror.getId(text.node),
                value: text.value,
            }); })
                // text mutation's id was not in the mirror map means the target node has been removed
                .filter(function (text) { return mirror.has(text.id); }),
            attributes: attributes
                .map(function (attribute) { return ({
                id: mirror.getId(attribute.node),
                attributes: attribute.attributes,
            }); })
                // attribute mutation's id was not in the mirror map means the target node has been removed
                .filter(function (attribute) { return mirror.has(attribute.id); }),
            removes: removes,
            adds: adds,
        };
        // payload may be empty if the mutations happened in some blocked elements
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
    var wrappedCb = throttle(function () {
        var totalOffset = Date.now() - timeBaseline;
        cb(positions.map(function (p) {
            p.timeOffset -= totalOffset;
            return p;
        }));
        positions = [];
        timeBaseline = null;
    }, 500);
    var updatePosition = throttle(function (evt) {
        var clientX = evt.clientX, clientY = evt.clientY, target = evt.target;
        if (!timeBaseline) {
            timeBaseline = Date.now();
        }
        positions.push({
            x: clientX,
            y: clientY,
            id: mirror.getId(target),
            timeOffset: Date.now() - timeBaseline,
        });
        wrappedCb();
    }, 50, {
        trailing: false,
    });
    return on('mousemove', updatePosition);
}
function initMouseInteractionObserver(cb, blockClass) {
    var handlers = [];
    var getHandler = function (eventKey) {
        return function (event) {
            if (isBlocked(event.target, blockClass)) {
                return;
            }
            var id = mirror.getId(event.target);
            var clientX = event.clientX, clientY = event.clientY;
            cb({
                type: MouseInteractions[eventKey],
                id: id,
                x: clientX,
                y: clientY,
            });
        };
    };
    Object.keys(MouseInteractions)
        .filter(function (key) { return Number.isNaN(Number(key)); })
        .forEach(function (eventKey) {
        var eventName = eventKey.toLowerCase();
        var handler = getHandler(eventKey);
        handlers.push(on(eventName, handler));
    });
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
function initScrollObserver(cb, blockClass) {
    var updatePosition = throttle(function (evt) {
        if (!evt.target || isBlocked(evt.target, blockClass)) {
            return;
        }
        var id = mirror.getId(evt.target);
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
    return on('scroll', updatePosition);
}
function initViewportResizeObserver(cb) {
    var updateDimension = throttle(function () {
        var height = getWindowHeight();
        var width = getWindowWidth();
        cb({
            width: Number(width),
            height: Number(height),
        });
    }, 200);
    return on('resize', updateDimension, window);
}
var INPUT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
var lastInputValueMap = new WeakMap();
function initInputObserver(cb, blockClass, ignoreClass) {
    function eventHandler(event) {
        var target = event.target;
        if (!target ||
            !target.tagName ||
            INPUT_TAGS.indexOf(target.tagName) < 0 ||
            isBlocked(target, blockClass)) {
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
        // if a radio was checked
        // the other radios with the same name attribute will be unchecked.
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
            var id = mirror.getId(target);
            cb(tslib_1.__assign({}, v, { id: id }));
        }
    }
    var handlers = [
        'input',
        'change',
    ].map(function (eventName) { return on(eventName, eventHandler); });
    var propertyDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    var hookProperties = [
        [HTMLInputElement.prototype, 'value'],
        [HTMLInputElement.prototype, 'checked'],
        [HTMLSelectElement.prototype, 'value'],
        [HTMLTextAreaElement.prototype, 'value'],
    ];
    if (propertyDescriptor && propertyDescriptor.set) {
        handlers.push.apply(handlers, tslib_1.__spread(hookProperties.map(function (p) {
            return hookSetter(p[0], p[1], {
                set: function () {
                    // mock to a normal event
                    eventHandler({ target: this });
                },
            });
        })));
    }
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
export default function initObservers(o) {
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
//# sourceMappingURL=observer.js.map