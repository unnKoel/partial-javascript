import { getCurrentScreenCapHub } from './hub/screencapHub';
function callOnScreenCapHub(method) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var hub = getCurrentScreenCapHub();
    if (hub && hub[method]) {
        return hub[method].apply(hub, args);
    }
    throw new Error("No hub defined or " + method + " was not found on the hub, please open a bug report.");
}
export function captureScreenCap(screenCapEvent) {
    return callOnScreenCapHub('captureScreenCap', screenCapEvent);
}
export function configureScreenCapScope(callback) {
    callOnScreenCapHub('configureScope', callback);
}
export function withScreenCapScope(callback) {
    callOnScreenCapHub('withScope', callback);
}
export function _callOnScreenCapClient(method) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    callOnScreenCapHub.apply(void 0, ['_invokeClient', method].concat(args));
}
//# sourceMappingURL=screencapsdk.js.map