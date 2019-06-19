export function isError(wat) {
    switch (Object.prototype.toString.call(wat)) {
        case '[object Error]':
            return true;
        case '[object Exception]':
            return true;
        case '[object DOMException]':
            return true;
        default:
            return wat instanceof Error;
    }
}
export function isErrorEvent(wat) {
    return Object.prototype.toString.call(wat) === '[object ErrorEvent]';
}
export function isDOMError(wat) {
    return Object.prototype.toString.call(wat) === '[object DOMError]';
}
export function isDOMException(wat) {
    return Object.prototype.toString.call(wat) === '[object DOMException]';
}
export function isString(wat) {
    return Object.prototype.toString.call(wat) === '[object String]';
}
export function isPrimitive(wat) {
    return wat === null || (typeof wat !== 'object' && typeof wat !== 'function');
}
export function isPlainObject(wat) {
    return Object.prototype.toString.call(wat) === '[object Object]';
}
export function isRegExp(wat) {
    return Object.prototype.toString.call(wat) === '[object RegExp]';
}
export function isThenable(wat) {
    return Boolean(wat && wat.then && typeof wat.then === 'function');
}
export function isSyntheticEvent(wat) {
    return isPlainObject(wat) && 'nativeEvent' in wat && 'preventDefault' in wat && 'stopPropagation' in wat;
}
//# sourceMappingURL=is.js.map