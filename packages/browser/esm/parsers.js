import { keysToEventMessage, normalizeToSize } from './utils';
import { _computeStackTrace } from './tracekit';
var STACKTRACE_LIMIT = 50;
export function exceptionFromStacktrace(stacktrace) {
    var frames = prepareFramesForEvent(stacktrace.stack);
    var exception = {
        type: stacktrace.name,
        value: stacktrace.message,
    };
    if (frames && frames.length) {
        exception.stacktrace = { frames: frames };
    }
    if (exception.type === undefined && exception.value === '') {
        exception.value = 'Unrecoverable error caught';
    }
    return exception;
}
export function eventFromPlainObject(exception, syntheticException) {
    var exceptionKeys = Object.keys(exception).sort();
    var event = {
        extra: {
            __serialized__: normalizeToSize(exception),
        },
        timestamp: Date.now(),
        message: "Non-Error exception captured with keys: " + keysToEventMessage(exceptionKeys),
    };
    if (syntheticException) {
        var stacktrace = _computeStackTrace(syntheticException);
        var frames_1 = prepareFramesForEvent(stacktrace.stack);
        event.stacktrace = {
            frames: frames_1,
        };
    }
    return event;
}
export function eventFromStacktrace(stacktrace) {
    var exception = exceptionFromStacktrace(stacktrace);
    return {
        timestamp: Date.now(),
        exception: {
            values: [exception],
        },
    };
}
export function prepareFramesForEvent(stack) {
    if (!stack || !stack.length) {
        return [];
    }
    var localStack = stack;
    var firstFrameFunction = localStack[0].func || '';
    var lastFrameFunction = localStack[localStack.length - 1].func || '';
    if (firstFrameFunction.includes('captureMessage') || firstFrameFunction.includes('captureException')) {
        localStack = localStack.slice(1);
    }
    if (lastFrameFunction.includes('sentryWrapped')) {
        localStack = localStack.slice(0, -1);
    }
    return localStack
        .map(function (frame) { return ({
        colno: frame.column,
        filename: frame.url || localStack[0].url,
        function: frame.func || '?',
        in_app: true,
        lineno: frame.line,
    }); })
        .slice(0, STACKTRACE_LIMIT)
        .reverse();
}
//# sourceMappingURL=parsers.js.map