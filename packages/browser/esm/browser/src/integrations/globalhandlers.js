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
import { getCurrentExceptionHub } from '../hub/exceptionHub';
import { addExceptionTypeValue, isString, logger, normalize, truncate } from '../utils';
import { eventFromStacktrace } from '../parsers';
import { _installGlobalHandler, _installGlobalUnhandledRejectionHandler, _subscribe, } from '../tracekit';
import { shouldIgnoreOnError } from './helpers';
var GlobalHandlers = (function () {
    function GlobalHandlers(options) {
        this.name = GlobalHandlers.id;
        this._options = __assign({ onerror: true, onunhandledrejection: true }, options);
    }
    GlobalHandlers.prototype.setupOnce = function () {
        var _this = this;
        Error.stackTraceLimit = 50;
        _subscribe(function (stack, _, error) {
            if (shouldIgnoreOnError()) {
                return;
            }
            getCurrentExceptionHub().captureEvent(_this._eventFromGlobalHandler(stack), {
                data: { stack: stack },
                originalException: error,
            });
        });
        if (this._options.onerror) {
            logger.log('Global Handler attached: onerror');
            _installGlobalHandler();
        }
        if (this._options.onunhandledrejection) {
            logger.log('Global Handler attached: onunhandledrejection');
            _installGlobalUnhandledRejectionHandler();
        }
    };
    GlobalHandlers.prototype._eventFromGlobalHandler = function (stacktrace) {
        if (!isString(stacktrace.message) && stacktrace.mechanism !== 'onunhandledrejection') {
            var message = stacktrace.message;
            stacktrace.message =
                message.error && isString(message.error.message) ? message.error.message : 'No error message';
        }
        var event = eventFromStacktrace(stacktrace);
        var data = {
            mode: stacktrace.mode,
        };
        if (stacktrace.message) {
            data.message = stacktrace.message;
        }
        if (stacktrace.name) {
            data.name = stacktrace.name;
        }
        var client = getCurrentExceptionHub().getClient();
        var maxValueLength = (client && client.getOptions().maxValueLength) || 250;
        var fallbackValue = stacktrace.original
            ? truncate(JSON.stringify(normalize(stacktrace.original)), maxValueLength)
            : '';
        var fallbackType = stacktrace.mechanism === 'onunhandledrejection' ? 'UnhandledRejection' : 'Error';
        addExceptionTypeValue(event, fallbackValue, fallbackType);
        return event;
    };
    GlobalHandlers.id = 'GlobalHandlers';
    return GlobalHandlers;
}());
export { GlobalHandlers };
//# sourceMappingURL=globalhandlers.js.map