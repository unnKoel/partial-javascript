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
import { getCurrentBehaviorHub } from '../hub/behaviorHub';
import { Severity } from '../types';
import { fill, getGlobalObject, normalize, parseUrl, safeJoin, supportsHistory, supportsNativeFetch, } from '../utils';
import { breadcrumbEventHandler, keypressEventHandler, wrap } from './helpers';
var global = getGlobalObject();
var lastHref;
var Breadcrumbs = (function () {
    function Breadcrumbs(options) {
        this.name = Breadcrumbs.id;
        this._options = __assign({ console: true, dom: true, fetch: true, history: true, sentry: true, xhr: true }, options);
    }
    Breadcrumbs.prototype._instrumentConsole = function () {
        if (!('console' in global)) {
            return;
        }
        ['debug', 'info', 'warn', 'error', 'log', 'assert'].forEach(function (level) {
            if (!(level in global.console)) {
                return;
            }
            fill(global.console, level, function (originalConsoleLevel) {
                return function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var breadcrumbData = {
                        category: 'console',
                        data: {
                            extra: {
                                arguments: normalize(args, 3),
                            },
                            logger: 'console',
                        },
                        level: Severity.fromString(level),
                        message: safeJoin(args, ' '),
                        timestamp: Date.now()
                    };
                    if (level === 'assert') {
                        if (args[0] === false) {
                            breadcrumbData.message = "Assertion failed: " + (safeJoin(args.slice(1), ' ') || 'console.assert');
                            breadcrumbData.data.extra.arguments = normalize(args.slice(1), 3);
                        }
                    }
                    Breadcrumbs.addBreadcrumb(breadcrumbData, {
                        input: args,
                        level: level,
                    });
                    if (originalConsoleLevel) {
                        Function.prototype.apply.call(originalConsoleLevel, global.console, args);
                    }
                };
            });
        });
    };
    Breadcrumbs.prototype._instrumentDOM = function () {
        if (!('document' in global)) {
            return;
        }
        global.document.addEventListener('click', breadcrumbEventHandler('click'), false);
        global.document.addEventListener('keypress', keypressEventHandler(), false);
        ['EventTarget', 'Node'].forEach(function (target) {
            var proto = global[target] && global[target].prototype;
            if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
                return;
            }
            fill(proto, 'addEventListener', function (original) {
                return function (eventName, fn, options) {
                    if (fn && fn.handleEvent) {
                        if (eventName === 'click') {
                            fill(fn, 'handleEvent', function (innerOriginal) {
                                return function (event) {
                                    breadcrumbEventHandler('click')(event);
                                    return innerOriginal.call(this, event);
                                };
                            });
                        }
                        if (eventName === 'keypress') {
                            fill(fn, 'handleEvent', keypressEventHandler());
                        }
                    }
                    else {
                        if (eventName === 'click') {
                            breadcrumbEventHandler('click', true)(this);
                        }
                        if (eventName === 'keypress') {
                            keypressEventHandler()(this);
                        }
                    }
                    return original.call(this, eventName, fn, options);
                };
            });
            fill(proto, 'removeEventListener', function (original) {
                return function (eventName, fn, options) {
                    var callback = fn;
                    try {
                        callback = callback && (callback.__sentry_wrapped__ || callback);
                    }
                    catch (e) {
                    }
                    return original.call(this, eventName, callback, options);
                };
            });
        });
    };
    Breadcrumbs.prototype._instrumentFetch = function () {
        if (!supportsNativeFetch()) {
            return;
        }
        fill(global, 'fetch', function (originalFetch) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var fetchInput = args[0];
                var method = 'GET';
                var url;
                if (typeof fetchInput === 'string') {
                    url = fetchInput;
                }
                else if ('Request' in global && fetchInput instanceof Request) {
                    url = fetchInput.url;
                    if (fetchInput.method) {
                        method = fetchInput.method;
                    }
                }
                else {
                    url = String(fetchInput);
                }
                if (args[1] && args[1].method) {
                    method = args[1].method;
                }
                var fetchData = {
                    method: method,
                    url: url,
                };
                return originalFetch
                    .apply(global, args)
                    .then(function (response) {
                    fetchData.status_code = response.status;
                    Breadcrumbs.addBreadcrumb({
                        category: 'fetch',
                        data: fetchData,
                        type: 'http',
                        timestamp: Date.now()
                    }, {
                        input: args,
                        response: response,
                    });
                    return response;
                })
                    .catch(function (error) {
                    Breadcrumbs.addBreadcrumb({
                        category: 'fetch',
                        data: fetchData,
                        level: Severity.Error,
                        type: 'http',
                        timestamp: Date.now()
                    }, {
                        error: error,
                        input: args,
                    });
                    throw error;
                });
            };
        });
    };
    Breadcrumbs.prototype._instrumentHistory = function () {
        var _this = this;
        if (!supportsHistory()) {
            return;
        }
        var captureUrlChange = function (from, to) {
            var parsedLoc = parseUrl(global.location.href);
            var parsedTo = parseUrl(to);
            var parsedFrom = parseUrl(from);
            if (!parsedFrom.path) {
                parsedFrom = parsedLoc;
            }
            lastHref = to;
            if (parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host) {
                to = parsedTo.relative;
            }
            if (parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host) {
                from = parsedFrom.relative;
            }
            Breadcrumbs.addBreadcrumb({
                category: 'navigation',
                timestamp: Date.now(),
                data: {
                    from: from,
                    to: to,
                },
            });
        };
        var oldOnPopState = global.onpopstate;
        global.onpopstate = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var currentHref = global.location.href;
            captureUrlChange(lastHref, currentHref);
            if (oldOnPopState) {
                return oldOnPopState.apply(_this, args);
            }
        };
        function historyReplacementFunction(originalHistoryFunction) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var url = args.length > 2 ? args[2] : undefined;
                if (url) {
                    captureUrlChange(lastHref, String(url));
                }
                return originalHistoryFunction.apply(this, args);
            };
        }
        fill(global.history, 'pushState', historyReplacementFunction);
        fill(global.history, 'replaceState', historyReplacementFunction);
    };
    Breadcrumbs.prototype._instrumentXHR = function () {
        if (!('XMLHttpRequest' in global)) {
            return;
        }
        function wrapProp(prop, xhr) {
            if (prop in xhr && typeof xhr[prop] === 'function') {
                fill(xhr, prop, function (original) {
                    return wrap(original);
                });
            }
        }
        var xhrproto = XMLHttpRequest.prototype;
        fill(xhrproto, 'open', function (originalOpen) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                this.__sentry_xhr__ = {
                    method: args[0],
                    url: args[1],
                };
                return originalOpen.apply(this, args);
            };
        });
        fill(xhrproto, 'send', function (originalSend) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var xhr = this;
                function onreadystatechangeHandler() {
                    if (xhr.readyState === 4) {
                        if (xhr.__sentry_own_request__) {
                            return;
                        }
                        try {
                            if (xhr.__sentry_xhr__) {
                                xhr.__sentry_xhr__.status_code = xhr.status;
                            }
                        }
                        catch (e) {
                        }
                        Breadcrumbs.addBreadcrumb({
                            category: 'xhr',
                            data: xhr.__sentry_xhr__,
                            type: 'http',
                            timestamp: Date.now()
                        }, {
                            xhr: xhr,
                        });
                    }
                }
                ['onload', 'onerror', 'onprogress'].forEach(function (prop) {
                    wrapProp(prop, xhr);
                });
                if ('onreadystatechange' in xhr && typeof xhr.onreadystatechange === 'function') {
                    fill(xhr, 'onreadystatechange', function (original) {
                        return wrap(original, {}, onreadystatechangeHandler);
                    });
                }
                else {
                    xhr.onreadystatechange = onreadystatechangeHandler;
                }
                return originalSend.apply(this, args);
            };
        });
    };
    Breadcrumbs.addBreadcrumb = function (breadcrumb, hint) {
        getCurrentBehaviorHub().captureBehavior(breadcrumb, hint);
    };
    Breadcrumbs.prototype.setupOnce = function () {
        if (this._options.console) {
            this._instrumentConsole();
        }
        if (this._options.dom) {
            this._instrumentDOM();
        }
        if (this._options.xhr) {
            this._instrumentXHR();
        }
        if (this._options.fetch) {
            this._instrumentFetch();
        }
        if (this._options.history) {
            this._instrumentHistory();
        }
    };
    Breadcrumbs.id = 'Breadcrumbs';
    return Breadcrumbs;
}());
export { Breadcrumbs };
//# sourceMappingURL=breadcrumbs.js.map