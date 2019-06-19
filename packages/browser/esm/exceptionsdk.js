import { getCurrentExceptionHub } from './hub/exceptionHub';
function callOnExceptionHub(method) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var hub = getCurrentExceptionHub();
    if (hub && hub[method]) {
        return hub[method].apply(hub, args);
    }
    throw new Error("No hub defined or " + method + " was not found on the hub, please open a bug report.");
}
export function captureException(exception) {
    var syntheticException;
    try {
        throw new Error('Sentry syntheticException');
    }
    catch (exception) {
        syntheticException = exception;
    }
    return callOnExceptionHub('captureException', exception, {
        originalException: exception,
        syntheticException: syntheticException,
    });
}
export function captureMessage(message, level) {
    var syntheticException;
    try {
        throw new Error(message);
    }
    catch (exception) {
        syntheticException = exception;
    }
    return callOnExceptionHub('captureMessage', message, level, {
        originalException: message,
        syntheticException: syntheticException,
    });
}
export function captureEvent(event) {
    return callOnExceptionHub('captureEvent', event);
}
export function configureExceptionScope(callback) {
    callOnExceptionHub('configureScope', callback);
}
export function withExceptionScope(callback) {
    callOnExceptionHub('withScope', callback);
}
export function _callOnExceptionClient(method) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    callOnExceptionHub.apply(void 0, ['_invokeClient', method].concat(args));
}
//# sourceMappingURL=exceptionsdk.js.map