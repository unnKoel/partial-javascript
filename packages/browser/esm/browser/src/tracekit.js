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
import { getGlobalObject, isError, isErrorEvent } from './utils';
var window = getGlobalObject();
var TraceKit = {
    _report: false,
    _collectWindowErrors: false,
    _computeStackTrace: false,
    _linesOfContext: false,
};
var UNKNOWN_FUNCTION = '?';
var ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/;
function _has(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}
function getLocationHref() {
    if (typeof document === 'undefined' || document.location == null)
        return '';
    return document.location.href;
}
TraceKit._report = (function reportModuleWrapper() {
    var handlers = [], lastException = null, lastExceptionStack = null;
    function _subscribe(handler) {
        handlers.push(handler);
    }
    function _notifyHandlers(stack, isWindowError, error) {
        var exception = null;
        if (isWindowError && !TraceKit._collectWindowErrors) {
            return;
        }
        for (var i in handlers) {
            if (_has(handlers, i)) {
                try {
                    handlers[i](stack, isWindowError, error);
                }
                catch (inner) {
                    exception = inner;
                }
            }
        }
        if (exception) {
            throw exception;
        }
    }
    var _oldOnerrorHandler, _onErrorHandlerInstalled;
    function _traceKitWindowOnError(message, url, lineNo, columnNo, errorObj) {
        var stack = null;
        errorObj = isErrorEvent(errorObj) ? errorObj.error : errorObj;
        message = isErrorEvent(message) ? message.message : message;
        if (lastExceptionStack) {
            TraceKit._computeStackTrace._augmentStackTraceWithInitialElement(lastExceptionStack, url, lineNo, message);
            processLastException();
        }
        else if (errorObj && isError(errorObj)) {
            stack = TraceKit._computeStackTrace(errorObj);
            stack.mechanism = 'onerror';
            _notifyHandlers(stack, true, errorObj);
        }
        else {
            var location = {
                url: url,
                line: lineNo,
                column: columnNo,
            };
            var name;
            var msg = message;
            if ({}.toString.call(message) === '[object String]') {
                var groups = message.match(ERROR_TYPES_RE);
                if (groups) {
                    name = groups[1];
                    msg = groups[2];
                }
            }
            location.func = UNKNOWN_FUNCTION;
            location.context = null;
            stack = {
                name: name,
                message: msg,
                mode: 'onerror',
                mechanism: 'onerror',
                stack: [
                    __assign({}, location, { url: location.url || getLocationHref() }),
                ],
            };
            _notifyHandlers(stack, true, null);
        }
        if (_oldOnerrorHandler) {
            return _oldOnerrorHandler.apply(this, arguments);
        }
        return false;
    }
    function _traceKitWindowOnUnhandledRejection(e) {
        var err = (e && (e.detail ? e.detail.reason : e.reason)) || e;
        var stack = TraceKit._computeStackTrace(err);
        stack.mechanism = 'onunhandledrejection';
        _notifyHandlers(stack, true, err);
    }
    function _installGlobalHandler() {
        if (_onErrorHandlerInstalled === true) {
            return;
        }
        _oldOnerrorHandler = window.onerror;
        window.onerror = _traceKitWindowOnError;
        _onErrorHandlerInstalled = true;
    }
    function _installGlobalUnhandledRejectionHandler() {
        window.onunhandledrejection = _traceKitWindowOnUnhandledRejection;
    }
    function processLastException() {
        var _lastExceptionStack = lastExceptionStack, _lastException = lastException;
        lastExceptionStack = null;
        lastException = null;
        _notifyHandlers(_lastExceptionStack, false, _lastException);
    }
    function _report(ex) {
        if (lastExceptionStack) {
            if (lastException === ex) {
                return;
            }
            else {
                processLastException();
            }
        }
        var stack = TraceKit._computeStackTrace(ex);
        lastExceptionStack = stack;
        lastException = ex;
        setTimeout(function () {
            if (lastException === ex) {
                processLastException();
            }
        }, stack.incomplete ? 2000 : 0);
        throw ex;
    }
    _report._subscribe = _subscribe;
    _report._installGlobalHandler = _installGlobalHandler;
    _report._installGlobalUnhandledRejectionHandler = _installGlobalUnhandledRejectionHandler;
    return _report;
})();
TraceKit._computeStackTrace = (function _computeStackTraceWrapper() {
    function _computeStackTraceFromStackProp(ex) {
        if (!ex.stack) {
            return null;
        }
        var chrome = /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|[a-z]:|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|moz-extension).*?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js))(?::(\d+))?(?::(\d+))?\s*$/i, winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i, isEval, geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i, chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/, lines = ex.stack.split('\n'), stack = [], submatch, parts, element, reference = /^(.*) is undefined$/.exec(ex.message);
        for (var i = 0, j = lines.length; i < j; ++i) {
            if ((parts = chrome.exec(lines[i]))) {
                var isNative = parts[2] && parts[2].indexOf('native') === 0;
                isEval = parts[2] && parts[2].indexOf('eval') === 0;
                if (isEval && (submatch = chromeEval.exec(parts[2]))) {
                    parts[2] = submatch[1];
                }
                element = {
                    url: !isNative ? parts[2] : null,
                    func: parts[1] || UNKNOWN_FUNCTION,
                    args: isNative ? [parts[2]] : [],
                    line: parts[3] ? +parts[3] : null,
                    column: parts[4] ? +parts[4] : null,
                };
            }
            else if ((parts = winjs.exec(lines[i]))) {
                element = {
                    url: parts[2],
                    func: parts[1] || UNKNOWN_FUNCTION,
                    args: [],
                    line: +parts[3],
                    column: parts[4] ? +parts[4] : null,
                };
            }
            else if ((parts = gecko.exec(lines[i]))) {
                isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
                if (isEval && (submatch = geckoEval.exec(parts[3]))) {
                    parts[3] = submatch[1];
                }
                else if (i === 0 && !parts[5] && ex.columnNumber !== void 0) {
                    stack[0].column = ex.columnNumber + 1;
                }
                element = {
                    url: parts[3],
                    func: parts[1] || UNKNOWN_FUNCTION,
                    args: parts[2] ? parts[2].split(',') : [],
                    line: parts[4] ? +parts[4] : null,
                    column: parts[5] ? +parts[5] : null,
                };
            }
            else {
                continue;
            }
            if (!element.func && element.line) {
                element.func = UNKNOWN_FUNCTION;
            }
            element.context = null;
            stack.push(element);
        }
        if (!stack.length) {
            return null;
        }
        if (stack[0] && stack[0].line && !stack[0].column && reference) {
            stack[0].column = null;
        }
        return {
            mode: 'stack',
            name: ex.name,
            message: ex.message,
            stack: stack,
        };
    }
    function _computeStackTraceFromStacktraceProp(ex) {
        var stacktrace = ex.stacktrace;
        if (!stacktrace) {
            return;
        }
        var opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i, opera11Regex = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^\)]+))\((.*)\))? in (.*):\s*$/i, lines = stacktrace.split('\n'), stack = [], parts;
        for (var line = 0; line < lines.length; line += 2) {
            var element = null;
            if ((parts = opera10Regex.exec(lines[line]))) {
                element = {
                    url: parts[2],
                    line: +parts[1],
                    column: null,
                    func: parts[3],
                    args: [],
                };
            }
            else if ((parts = opera11Regex.exec(lines[line]))) {
                element = {
                    url: parts[6],
                    line: +parts[1],
                    column: +parts[2],
                    func: parts[3] || parts[4],
                    args: parts[5] ? parts[5].split(',') : [],
                };
            }
            if (element) {
                if (!element.func && element.line) {
                    element.func = UNKNOWN_FUNCTION;
                }
                if (element.line) {
                    element.context = null;
                }
                if (!element.context) {
                    element.context = [lines[line + 1]];
                }
                stack.push(element);
            }
        }
        if (!stack.length) {
            return null;
        }
        return {
            mode: 'stacktrace',
            name: ex.name,
            message: ex.message,
            stack: stack,
        };
    }
    function _computeStackTraceFromOperaMultiLineMessage(ex) {
        var lines = ex.message.split('\n');
        if (lines.length < 4) {
            return null;
        }
        var lineRE1 = /^\s*Line (\d+) of linked script ((?:file|https?|blob)\S+)(?:: in function (\S+))?\s*$/i, lineRE2 = /^\s*Line (\d+) of inline#(\d+) script in ((?:file|https?|blob)\S+)(?:: in function (\S+))?\s*$/i, lineRE3 = /^\s*Line (\d+) of function script\s*$/i, stack = [], scripts = window && window.document && window.document.getElementsByTagName('script'), inlineScriptBlocks = [], parts;
        for (var s in scripts) {
            if (_has(scripts, s) && !scripts[s].src) {
                inlineScriptBlocks.push(scripts[s]);
            }
        }
        for (var line = 2; line < lines.length; line += 2) {
            var item = null;
            if ((parts = lineRE1.exec(lines[line]))) {
                item = {
                    url: parts[2],
                    func: parts[3],
                    args: [],
                    line: +parts[1],
                    column: null,
                };
            }
            else if ((parts = lineRE2.exec(lines[line]))) {
                item = {
                    url: parts[3],
                    func: parts[4],
                    args: [],
                    line: +parts[1],
                    column: null,
                };
            }
            else if ((parts = lineRE3.exec(lines[line]))) {
                var url = getLocationHref().replace(/#.*$/, '');
                item = {
                    url: url,
                    func: '',
                    args: [],
                    line: parts[1],
                    column: null,
                };
            }
            if (item) {
                if (!item.func) {
                    item.func = UNKNOWN_FUNCTION;
                }
                item.context = [lines[line + 1]];
                stack.push(item);
            }
        }
        if (!stack.length) {
            return null;
        }
        return {
            mode: 'multiline',
            name: ex.name,
            message: lines[0],
            stack: stack,
        };
    }
    function _augmentStackTraceWithInitialElement(stackInfo, url, lineNo, message) {
        var initial = {
            url: url,
            line: lineNo,
        };
        if (initial.url && initial.line) {
            stackInfo.incomplete = false;
            if (!initial.func) {
                initial.func = UNKNOWN_FUNCTION;
            }
            if (!initial.context) {
                initial.context = null;
            }
            var reference = / '([^']+)' /.exec(message);
            if (reference) {
                initial.column = null;
            }
            if (stackInfo.stack.length > 0) {
                if (stackInfo.stack[0].url === initial.url) {
                    if (stackInfo.stack[0].line === initial.line) {
                        return false;
                    }
                    else if (!stackInfo.stack[0].line && stackInfo.stack[0].func === initial.func) {
                        stackInfo.stack[0].line = initial.line;
                        stackInfo.stack[0].context = initial.context;
                        return false;
                    }
                }
            }
            stackInfo.stack.unshift(initial);
            stackInfo.partial = true;
            return true;
        }
        else {
            stackInfo.incomplete = true;
        }
        return false;
    }
    function _computeStackTraceByWalkingCallerChain(ex, depth) {
        var functionName = /function\s+([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?\s*\(/i, stack = [], funcs = {}, recursion = false, parts, item;
        for (var curr = _computeStackTraceByWalkingCallerChain.caller; curr && !recursion; curr = curr.caller) {
            if (curr === _computeStackTrace || curr === TraceKit._report) {
                continue;
            }
            item = {
                url: null,
                func: UNKNOWN_FUNCTION,
                args: [],
                line: null,
                column: null,
            };
            if (curr.name) {
                item.func = curr.name;
            }
            else if ((parts = functionName.exec(curr.toString()))) {
                item.func = parts[1];
            }
            if (typeof item.func === 'undefined') {
                try {
                    item.func = parts.input.substring(0, parts.input.indexOf('{'));
                }
                catch (e) { }
            }
            if (funcs['' + curr]) {
                recursion = true;
            }
            else {
                funcs['' + curr] = true;
            }
            stack.push(item);
        }
        if (depth) {
            stack.splice(0, depth);
        }
        var result = {
            mode: 'callers',
            name: ex.name,
            message: ex.message,
            stack: stack,
        };
        _augmentStackTraceWithInitialElement(result, ex.sourceURL || ex.fileName, ex.line || ex.lineNumber, ex.message || ex.description);
        return result;
    }
    function computeStackTrace(ex, depth) {
        var stack = null;
        depth = depth == null ? 0 : +depth;
        try {
            stack = _computeStackTraceFromStacktraceProp(ex);
            if (stack) {
                return stack;
            }
        }
        catch (e) { }
        try {
            stack = _computeStackTraceFromStackProp(ex);
            if (stack) {
                return stack;
            }
        }
        catch (e) { }
        try {
            stack = _computeStackTraceFromOperaMultiLineMessage(ex);
            if (stack) {
                return stack;
            }
        }
        catch (e) { }
        try {
            stack = _computeStackTraceByWalkingCallerChain(ex, depth + 1);
            if (stack) {
                return stack;
            }
        }
        catch (e) { }
        return {
            original: ex,
            name: ex.name,
            message: ex.message,
            mode: 'failed',
        };
    }
    computeStackTrace._augmentStackTraceWithInitialElement = _augmentStackTraceWithInitialElement;
    computeStackTrace._computeStackTraceFromStackProp = _computeStackTraceFromStackProp;
    return computeStackTrace;
})();
TraceKit._collectWindowErrors = true;
TraceKit._linesOfContext = 11;
var _subscribe = TraceKit._report._subscribe;
var _installGlobalHandler = TraceKit._report._installGlobalHandler;
var _installGlobalUnhandledRejectionHandler = TraceKit._report._installGlobalUnhandledRejectionHandler;
var _computeStackTrace = TraceKit._computeStackTrace;
export { _subscribe, _installGlobalHandler, _installGlobalUnhandledRejectionHandler, _computeStackTrace };
//# sourceMappingURL=tracekit.js.map