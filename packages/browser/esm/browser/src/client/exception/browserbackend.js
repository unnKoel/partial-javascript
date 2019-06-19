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
import { Severity } from '../../types';
import { addExceptionTypeValue, isDOMError, isDOMException, isError, isErrorEvent, isPlainObject, SyncPromise, } from '../../utils';
import { eventFromPlainObject, eventFromStacktrace, prepareFramesForEvent } from './parsers';
import { _computeStackTrace } from './tracekit';
var BrowserBackend = (function () {
    function BrowserBackend() {
    }
    BrowserBackend.prototype.eventFromException = function (exception, hint) {
        var _this = this;
        var event;
        if (isErrorEvent(exception) && exception.error) {
            var errorEvent = exception;
            exception = errorEvent.error;
            event = eventFromStacktrace(_computeStackTrace(exception));
            return SyncPromise.resolve(this._buildEvent(event, hint));
        }
        if (isDOMError(exception) || isDOMException(exception)) {
            var domException = exception;
            var name_1 = domException.name || (isDOMError(domException) ? 'DOMError' : 'DOMException');
            var message_1 = domException.message ? name_1 + ": " + domException.message : name_1;
            return this.eventFromMessage(message_1, Severity.Error, hint).then(function (messageEvent) {
                addExceptionTypeValue(messageEvent, message_1);
                return SyncPromise.resolve(_this._buildEvent(messageEvent, hint));
            });
        }
        if (isError(exception)) {
            event = eventFromStacktrace(_computeStackTrace(exception));
            return SyncPromise.resolve(this._buildEvent(event, hint));
        }
        if (isPlainObject(exception) && hint && hint.syntheticException) {
            var objectException = exception;
            event = eventFromPlainObject(objectException, hint.syntheticException);
            addExceptionTypeValue(event, 'Custom Object', undefined);
            event.level = Severity.Error;
            return SyncPromise.resolve(this._buildEvent(event, hint));
        }
        var stringException = exception;
        return this.eventFromMessage(stringException, undefined, hint).then(function (messageEvent) {
            addExceptionTypeValue(messageEvent, "" + stringException, undefined);
            messageEvent.level = Severity.Error;
            return SyncPromise.resolve(_this._buildEvent(messageEvent, hint));
        });
    };
    BrowserBackend.prototype._buildEvent = function (event, hint) {
        return __assign({}, event, { event_id: hint && hint.event_id });
    };
    BrowserBackend.prototype.eventFromMessage = function (message, level, hint) {
        if (level === void 0) { level = Severity.Info; }
        var event = {
            event_id: hint && hint.event_id,
            level: level,
            message: message,
            timestamp: Date.now()
        };
        if (hint && hint.syntheticException) {
            var stacktrace = _computeStackTrace(hint.syntheticException);
            var frames_1 = prepareFramesForEvent(stacktrace.stack);
            event.stacktrace = {
                frames: frames_1,
            };
        }
        return SyncPromise.resolve(event);
    };
    return BrowserBackend;
}());
export { BrowserBackend };
//# sourceMappingURL=browserbackend.js.map