import { getCurrentBehaviorHub } from './hub/behaviorHub';
function callOnBehaviorHub(method) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var hub = getCurrentBehaviorHub();
    if (hub && hub[method]) {
        return hub[method].apply(hub, args);
    }
    throw new Error("No hub defined or " + method + " was not found on the hub, please open a bug report.");
}
export function captureBehavior(breadcrumb) {
    return callOnBehaviorHub('captureBehavior', breadcrumb);
}
export function configureBehaviorScope(callback) {
    callOnBehaviorHub('configureScope', callback);
}
export function withBehaviorScope(callback) {
    callOnBehaviorHub('withScope', callback);
}
export function _callOnBehaviorClient(method) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    callOnBehaviorHub.apply(void 0, ['_invokeClient', method].concat(args));
}
//# sourceMappingURL=behaviorsdk.js.map