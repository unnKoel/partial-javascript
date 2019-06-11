import * as tslib_1 from "tslib";
import { snapshot } from "@partial/rrweb-snapshot";
import initObservers from "./observer";
import { mirror, on, getWindowWidth, getWindowHeight } from "../utils";
import { EventType, IncrementalSource } from "../types";
function wrapEvent(e) {
    return tslib_1.__assign({}, e, { timestamp: Date.now() });
}
function record(options) {
    if (options === void 0) { options = {}; }
    var emit = options.emit, checkoutEveryNms = options.checkoutEveryNms, //checkout every N millisecond.
    checkoutEveryNth = options.checkoutEveryNth, //checkout every N times.
    _a = options.blockClass, //checkout every N times.
    blockClass = _a === void 0 ? "rr-block" : _a, //  An element with the class name .rr-block will not be recorded.
    _b = options.ignoreClass, //  An element with the class name .rr-block will not be recorded.
    ignoreClass = _b === void 0 ? "rr-ignore" : _b, // don't record it's input event.
    _c = options.inlineStylesheet, // don't record it's input event.
    inlineStylesheet = _c === void 0 ? true : _c;
    // runtime checks for user options
    if (!emit) {
        throw new Error("emit function is required");
    }
    var lastFullSnapshotEvent;
    var incrementalSnapshotCount = 0; //incremental snapshot count
    var wrappedEmit = function (e, isCheckout) {
        emit(e, isCheckout);
        if (e.type === EventType.FullSnapshot) {
            lastFullSnapshotEvent = e;
            incrementalSnapshotCount = 0;
        }
        else if (e.type === EventType.IncrementalSnapshot) {
            incrementalSnapshotCount++;
            var exceedCount = checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
            var exceedTime = checkoutEveryNms &&
                e.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
            if (exceedCount || exceedTime) {
                takeFullSnapshot(true);
            }
        }
    };
    /**
     * take full snapshot
     * @param isCheckout
     */
    function takeFullSnapshot(isCheckout) {
        if (isCheckout === void 0) { isCheckout = false; }
        wrappedEmit(wrapEvent({
            type: EventType.Meta,
            data: {
                href: window.location.href,
                width: getWindowWidth(),
                height: getWindowHeight()
            }
        }), isCheckout);
        var _a = tslib_1.__read(snapshot(document, blockClass, inlineStylesheet), 2), node = _a[0], idNodeMap = _a[1];
        if (!node) {
            return console.warn("Failed to snapshot the document");
        }
        mirror.map = idNodeMap;
        wrappedEmit(wrapEvent({
            type: EventType.FullSnapshot,
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
        handlers_1.push(on("DOMContentLoaded", function () {
            wrappedEmit(wrapEvent({
                type: EventType.DomContentLoaded,
                data: {}
            }));
        }));
        var init_1 = function () {
            takeFullSnapshot();
            handlers_1.push(initObservers({
                mutationCb: function (m) {
                    return wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: tslib_1.__assign({ source: IncrementalSource.Mutation }, m)
                    }));
                },
                mousemoveCb: function (positions) {
                    return wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: {
                            source: IncrementalSource.MouseMove,
                            positions: positions
                        }
                    }));
                },
                mouseInteractionCb: function (d) {
                    return wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: tslib_1.__assign({ source: IncrementalSource.MouseInteraction }, d)
                    }));
                },
                scrollCb: function (p) {
                    return wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: tslib_1.__assign({ source: IncrementalSource.Scroll }, p)
                    }));
                },
                viewportResizeCb: function (d) {
                    return wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: tslib_1.__assign({ source: IncrementalSource.ViewportResize }, d)
                    }));
                },
                inputCb: function (v) {
                    return wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: tslib_1.__assign({ source: IncrementalSource.Input }, v)
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
            handlers_1.push(on("load", function () {
                wrappedEmit(wrapEvent({
                    type: EventType.Load,
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
        // TODO: handle internal error
        console.warn(error);
    }
}
export default record;
//# sourceMappingURL=index.js.map