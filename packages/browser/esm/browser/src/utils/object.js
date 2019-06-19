import { isError, isPrimitive, isSyntheticEvent } from './is';
import { Memo } from './memo';
export function fill(source, name, replacement) {
    if (!(name in source)) {
        return;
    }
    var original = source[name];
    var wrapped = replacement(original);
    if (typeof wrapped === 'function') {
        try {
            wrapped.prototype = wrapped.prototype || {};
            Object.defineProperties(wrapped, {
                __sentry__: {
                    enumerable: false,
                    value: true,
                },
                __sentry_original__: {
                    enumerable: false,
                    value: original,
                },
                __sentry_wrapped__: {
                    enumerable: false,
                    value: wrapped,
                },
            });
        }
        catch (_Oo) {
        }
    }
    source[name] = wrapped;
}
export function urlEncode(object) {
    return Object.keys(object)
        .map(function (key) { return encodeURIComponent(key) + "=" + encodeURIComponent(object[key]); })
        .join('&');
}
function objectifyError(error) {
    var err = {
        message: error.message,
        name: error.name,
        stack: error.stack,
    };
    for (var i in error) {
        if (Object.prototype.hasOwnProperty.call(error, i)) {
            err[i] = error[i];
        }
    }
    return err;
}
function utf8Length(value) {
    return ~-encodeURI(value).split(/%..|./).length;
}
function jsonSize(value) {
    return utf8Length(JSON.stringify(value));
}
export function normalizeToSize(object, depth, maxSize) {
    if (depth === void 0) { depth = 3; }
    if (maxSize === void 0) { maxSize = 100 * 1024; }
    var serialized = normalize(object, depth);
    if (jsonSize(serialized) > maxSize) {
        return normalizeToSize(object, depth - 1, maxSize);
    }
    return serialized;
}
function serializeValue(value) {
    var type = Object.prototype.toString.call(value);
    if (typeof value === 'string') {
        return value;
    }
    if (type === '[object Object]') {
        return '[Object]';
    }
    if (type === '[object Array]') {
        return '[Array]';
    }
    var normalized = normalizeValue(value);
    return isPrimitive(normalized) ? normalized : type;
}
function normalizeValue(value, key) {
    if (key === 'domain' && typeof value === 'object' && value._events) {
        return '[Domain]';
    }
    if (key === 'domainEmitter') {
        return '[DomainEmitter]';
    }
    if (typeof global !== 'undefined' && value === global) {
        return '[Global]';
    }
    if (typeof window !== 'undefined' && value === window) {
        return '[Window]';
    }
    if (typeof document !== 'undefined' && value === document) {
        return '[Document]';
    }
    if (typeof Event !== 'undefined' && value instanceof Event) {
        return Object.getPrototypeOf(value) ? value.constructor.name : 'Event';
    }
    if (isSyntheticEvent(value)) {
        return '[SyntheticEvent]';
    }
    if (Number.isNaN(value)) {
        return '[NaN]';
    }
    if (value === void 0) {
        return '[undefined]';
    }
    if (typeof value === 'function') {
        return "[Function: " + (value.name || '<unknown-function-name>') + "]";
    }
    return value;
}
export function walk(key, value, depth, memo) {
    if (depth === void 0) { depth = +Infinity; }
    if (memo === void 0) { memo = new Memo(); }
    if (depth === 0) {
        return serializeValue(value);
    }
    if (value !== null && value !== undefined && typeof value.toJSON === 'function') {
        return value.toJSON();
    }
    var normalized = normalizeValue(value, key);
    if (isPrimitive(normalized)) {
        return normalized;
    }
    var source = (isError(value) ? objectifyError(value) : value);
    var acc = Array.isArray(value) ? [] : {};
    if (memo.memoize(value)) {
        return '[Circular ~]';
    }
    for (var innerKey in source) {
        if (!Object.prototype.hasOwnProperty.call(source, innerKey)) {
            continue;
        }
        acc[innerKey] = walk(innerKey, source[innerKey], depth - 1, memo);
    }
    memo.unmemoize(value);
    return acc;
}
export function normalize(input, depth) {
    try {
        return JSON.parse(JSON.stringify(input, function (key, value) { return walk(key, value, depth); }));
    }
    catch (_oO) {
        return '**non-serializable**';
    }
}
//# sourceMappingURL=object.js.map