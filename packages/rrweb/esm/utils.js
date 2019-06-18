"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function on(type, fn, target) {
    if (target === void 0) { target = document; }
    var options = { capture: true, passive: true };
    target.addEventListener(type, fn, options);
    return function () { return target.removeEventListener(type, fn, options); };
}
exports.on = on;
exports.mirror = {
    map: {},
    getId: function (n) {
        if (!n.__sn) {
            return -1;
        }
        return n.__sn.id;
    },
    getNode: function (id) {
        return exports.mirror.map[id] || null;
    },
    removeNodeFromMap: function (n) {
        var id = n.__sn && n.__sn.id;
        delete exports.mirror.map[id];
        if (n.childNodes) {
            n.childNodes.forEach(function (child) {
                return exports.mirror.removeNodeFromMap(child);
            });
        }
    },
    has: function (id) {
        return exports.mirror.map.hasOwnProperty(id);
    },
};
function throttle(func, wait, options) {
    if (options === void 0) { options = {}; }
    var timeout = null;
    var previous = 0;
    return function () {
        var now = Date.now();
        if (!previous && options.leading === false) {
            previous = now;
        }
        var remaining = wait - (now - previous);
        var context = this;
        var args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                window.clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(context, args);
        }
        else if (!timeout && options.trailing !== false) {
            timeout = window.setTimeout(function () {
                previous = options.leading === false ? 0 : Date.now();
                timeout = null;
                func.apply(context, args);
            }, remaining);
        }
    };
}
exports.throttle = throttle;
function hookSetter(target, key, d) {
    var original = Object.getOwnPropertyDescriptor(target, key);
    Object.defineProperty(target, key, {
        set: function (value) {
            var _this = this;
            setTimeout(function () {
                d.set.call(_this, value);
            }, 0);
            if (original && original.set) {
                original.set.call(this, value);
            }
        },
    });
    return function () { return hookSetter(target, key, original || {}); };
}
exports.hookSetter = hookSetter;
function getWindowHeight() {
    return (window.innerHeight ||
        (document.documentElement && document.documentElement.clientHeight) ||
        (document.body && document.body.clientHeight));
}
exports.getWindowHeight = getWindowHeight;
function getWindowWidth() {
    return (window.innerWidth ||
        (document.documentElement && document.documentElement.clientWidth) ||
        (document.body && document.body.clientWidth));
}
exports.getWindowWidth = getWindowWidth;
function isBlocked(node, blockClass) {
    if (!node) {
        return false;
    }
    if (node.nodeType === node.ELEMENT_NODE) {
        var needBlock_1 = false;
        if (typeof blockClass === 'string') {
            needBlock_1 = node.classList.contains(blockClass);
        }
        else {
            node.classList.forEach(function (className) {
                if (blockClass.test(className)) {
                    needBlock_1 = true;
                }
            });
        }
        return needBlock_1 || isBlocked(node.parentNode, blockClass);
    }
    return isBlocked(node.parentNode, blockClass);
}
exports.isBlocked = isBlocked;
function isAncestorRemoved(target) {
    var id = exports.mirror.getId(target);
    if (!exports.mirror.has(id)) {
        return true;
    }
    if (target.parentNode &&
        target.parentNode.nodeType === target.DOCUMENT_NODE) {
        return false;
    }
    if (!target.parentNode) {
        return true;
    }
    return isAncestorRemoved(target.parentNode);
}
exports.isAncestorRemoved = isAncestorRemoved;
//# sourceMappingURL=utils.js.map