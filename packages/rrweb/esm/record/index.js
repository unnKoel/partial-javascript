"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var rrweb_snapshot_1 = require("@partial/rrweb-snapshot");
var observer_1 = require("./observer");
var utils_1 = require("../utils");
var types_1 = require("../types");
function wrapEvent(e) {
    return __assign({}, e, { timestamp: Date.now() });
}
function record(options) {
    if (options === void 0) { options = {}; }
    var emit = options.emit, checkoutEveryNms = options.checkoutEveryNms, checkoutEveryNth = options.checkoutEveryNth, _a = options.blockClass, blockClass = _a === void 0 ? "rr-block" : _a, _b = options.ignoreClass, ignoreClass = _b === void 0 ? "rr-ignore" : _b, _c = options.inlineStylesheet, inlineStylesheet = _c === void 0 ? true : _c;
    if (!emit) {
        throw new Error("emit function is required");
    }
    var lastFullSnapshotEvent;
    var incrementalSnapshotCount = 0;
    var wrappedEmit = function (e, isCheckout) {
        emit(e, isCheckout);
        if (e.type === types_1.EventType.FullSnapshot) {
            lastFullSnapshotEvent = e;
            incrementalSnapshotCount = 0;
        }
        else if (e.type === types_1.EventType.IncrementalSnapshot) {
            incrementalSnapshotCount++;
            var exceedCount = checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
            var exceedTime = checkoutEveryNms &&
                e.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
            if (exceedCount || exceedTime) {
                takeFullSnapshot(true);
            }
        }
    };
    function takeFullSnapshot(isCheckout) {
        if (isCheckout === void 0) { isCheckout = false; }
        wrappedEmit(wrapEvent({
            type: types_1.EventType.Meta,
            data: {
                href: window.location.href,
                width: utils_1.getWindowWidth(),
                height: utils_1.getWindowHeight()
            }
        }), isCheckout);
        var _a = rrweb_snapshot_1.snapshot(document, blockClass, inlineStylesheet), node = _a[0], idNodeMap = _a[1];
        if (!node) {
            return console.warn("Failed to snapshot the document");
        }
        utils_1.mirror.map = idNodeMap;
        wrappedEmit(wrapEvent({
            type: types_1.EventType.FullSnapshot,
            data: {
                node: node,
                initialOffset: {
                    left: document.documentElement.scrollLeft,
                    top: document.documentElement.scrollTop
                }
            }
        }));
    }
    try {
        var handlers_1 = [];
        handlers_1.push(utils_1.on("DOMContentLoaded", function () {
            wrappedEmit(wrapEvent({
                type: types_1.EventType.DomContentLoaded,
                data: {}
            }));
        }));
        var init_1 = function () {
            takeFullSnapshot();
            handlers_1.push(observer_1.default({
                mutationCb: function (m) {
                    return wrappedEmit(wrapEvent({
                        type: types_1.EventType.IncrementalSnapshot,
                        data: __assign({ source: types_1.IncrementalSource.Mutation }, m)
                    }));
                },
                mousemoveCb: function (positions) {
                    return wrappedEmit(wrapEvent({
                        type: types_1.EventType.IncrementalSnapshot,
                        data: {
                            source: types_1.IncrementalSource.MouseMove,
                            positions: positions
                        }
                    }));
                },
                mouseInteractionCb: function (d) {
                    return wrappedEmit(wrapEvent({
                        type: types_1.EventType.IncrementalSnapshot,
                        data: __assign({ source: types_1.IncrementalSource.MouseInteraction }, d)
                    }));
                },
                scrollCb: function (p) {
                    return wrappedEmit(wrapEvent({
                        type: types_1.EventType.IncrementalSnapshot,
                        data: __assign({ source: types_1.IncrementalSource.Scroll }, p)
                    }));
                },
                viewportResizeCb: function (d) {
                    return wrappedEmit(wrapEvent({
                        type: types_1.EventType.IncrementalSnapshot,
                        data: __assign({ source: types_1.IncrementalSource.ViewportResize }, d)
                    }));
                },
                inputCb: function (v) {
                    return wrappedEmit(wrapEvent({
                        type: types_1.EventType.IncrementalSnapshot,
                        data: __assign({ source: types_1.IncrementalSource.Input }, v)
                    }));
                },
                blockClass: blockClass,
                ignoreClass: ignoreClass,
                inlineStylesheet: inlineStylesheet
            }));
        };
        if (document.readyState === "interactive" ||
            document.readyState === "complete") {
            init_1();
        }
        else {
            handlers_1.push(utils_1.on("load", function () {
                wrappedEmit(wrapEvent({
                    type: types_1.EventType.Load,
                    data: {}
                }));
                init_1();
            }, window));
        }
        return function () {
            handlers_1.forEach(function (h) { return h(); });
        };
    }
    catch (error) {
        console.warn(error);
    }
}
exports.default = record;
//# sourceMappingURL=index.js.map