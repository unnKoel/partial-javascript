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
import { captureException, withExceptionScope } from '../exceptionsdk';
import { getCurrentBehaviorHub } from '../hub/behaviorHub';
import { isString, normalize } from '../utils';
var debounceDuration = 1000;
var keypressTimeout;
var lastCapturedEvent;
var ignoreOnError = 0;
export function shouldIgnoreOnError() {
    return ignoreOnError > 0;
}
export function ignoreNextOnError() {
    ignoreOnError += 1;
    setTimeout(function () {
        ignoreOnError -= 1;
    });
}
export function wrap(fn, options, before) {
    if (options === void 0) { options = {}; }
    if (typeof fn !== 'function') {
        return fn;
    }
    try {
        if (fn.__sentry__) {
            return fn;
        }
        if (fn.__sentry_wrapped__) {
            return fn.__sentry_wrapped__;
        }
    }
    catch (e) {
        return fn;
    }
    var sentryWrapped = function () {
        if (before && typeof before === 'function') {
            before.apply(this, arguments);
        }
        var args = Array.prototype.slice.call(arguments);
        try {
            var wrappedArguments = args.map(function (arg) { return wrap(arg, options); });
            if (fn.handleEvent) {
                return fn.handleEvent.apply(this, wrappedArguments);
            }
            return fn.apply(this, wrappedArguments);
        }
        catch (ex) {
            ignoreNextOnError();
            withExceptionScope(function (scope) {
                scope.addProcessor(function (event) {
                    var processedEvent = __assign({}, event);
                    processedEvent.extra = __assign({}, processedEvent.extra, { arguments: normalize(args, 3) });
                    return processedEvent;
                });
                captureException(ex);
            });
            throw ex;
        }
    };
    try {
        for (var property in fn) {
            if (Object.prototype.hasOwnProperty.call(fn, property)) {
                sentryWrapped[property] = fn[property];
            }
        }
    }
    catch (_oO) { }
    fn.prototype = fn.prototype || {};
    sentryWrapped.prototype = fn.prototype;
    Object.defineProperty(fn, '__sentry_wrapped__', {
        enumerable: false,
        value: sentryWrapped,
    });
    Object.defineProperties(sentryWrapped, {
        __sentry__: {
            enumerable: false,
            value: true,
        },
        __sentry_original__: {
            enumerable: false,
            value: fn,
        },
    });
    try {
        Object.defineProperty(sentryWrapped, 'name', {
            get: function () {
                return fn.name;
            },
        });
    }
    catch (_oO) {
    }
    return sentryWrapped;
}
var debounceTimer = 0;
export function breadcrumbEventHandler(eventName, debounce) {
    if (debounce === void 0) { debounce = false; }
    return function (event) {
        keypressTimeout = undefined;
        if (!event || lastCapturedEvent === event) {
            return;
        }
        lastCapturedEvent = event;
        var captureBreadcrumb = function () {
            var target;
            try {
                target = event.target ? _htmlTreeAsString(event.target) : _htmlTreeAsString(event);
            }
            catch (e) {
                target = '<unknown>';
            }
            if (target.length === 0) {
                return;
            }
            getCurrentBehaviorHub().captureBehavior({
                category: "ui." + eventName,
                message: target,
                timestamp: Date.now()
            }, {
                event: event,
                name: eventName,
            });
        };
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        if (debounce) {
            debounceTimer = setTimeout(captureBreadcrumb);
        }
        else {
            captureBreadcrumb();
        }
    };
}
export function keypressEventHandler() {
    return function (event) {
        var target;
        try {
            target = event.target;
        }
        catch (e) {
            return;
        }
        var tagName = target && target.tagName;
        if (!tagName || (tagName !== 'INPUT' && tagName !== 'TEXTAREA' && !target.isContentEditable)) {
            return;
        }
        if (!keypressTimeout) {
            breadcrumbEventHandler('input')(event);
        }
        clearTimeout(keypressTimeout);
        keypressTimeout = setTimeout(function () {
            keypressTimeout = undefined;
        }, debounceDuration);
    };
}
function _htmlTreeAsString(elem) {
    var currentElem = elem;
    var MAX_TRAVERSE_HEIGHT = 5;
    var MAX_OUTPUT_LEN = 80;
    var out = [];
    var height = 0;
    var len = 0;
    var separator = ' > ';
    var sepLength = separator.length;
    var nextStr;
    while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
        nextStr = _htmlElementAsString(currentElem);
        if (nextStr === 'html' || (height > 1 && len + out.length * sepLength + nextStr.length >= MAX_OUTPUT_LEN)) {
            break;
        }
        out.push(nextStr);
        len += nextStr.length;
        currentElem = currentElem.parentNode;
    }
    return out.reverse().join(separator);
}
function _htmlElementAsString(elem) {
    var out = [];
    var className;
    var classes;
    var key;
    var attr;
    var i;
    if (!elem || !elem.tagName) {
        return '';
    }
    out.push(elem.tagName.toLowerCase());
    if (elem.id) {
        out.push("#" + elem.id);
    }
    className = elem.className;
    if (className && isString(className)) {
        classes = className.split(/\s+/);
        for (i = 0; i < classes.length; i++) {
            out.push("." + classes[i]);
        }
    }
    var attrWhitelist = ['type', 'name', 'title', 'alt'];
    for (i = 0; i < attrWhitelist.length; i++) {
        key = attrWhitelist[i];
        attr = elem.getAttribute(key);
        if (attr) {
            out.push("[" + key + "=\"" + attr + "\"]");
        }
    }
    return out.join('');
}
//# sourceMappingURL=helpers.js.map