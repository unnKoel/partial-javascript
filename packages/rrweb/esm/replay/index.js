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
import { rebuild, buildNodeWithSN } from "@partial/rrweb-snapshot";
import * as mittProxy from "mitt";
import * as smoothscroll from "smoothscroll-polyfill";
import Timer from "./timer";
import { EventType, IncrementalSource, MouseInteractions, ReplayerEvents } from "../types";
import { mirror } from "../utils";
import getInjectStyleRules from "./styles/inject-style";
import "./styles/style.css";
var SKIP_TIME_THRESHOLD = 10 * 1000;
var SKIP_TIME_INTERVAL = 5 * 1000;
var mitt = mittProxy.default || mittProxy;
var REPLAY_CONSOLE_PREFIX = "[replayer]";
var Replayer = (function () {
    function Replayer(events, config) {
        this.events = [];
        this.emitter = mitt();
        this.baselineTime = 0;
        this.noramlSpeed = -1;
        this.missingNodeRetryMap = {};
        if (events.length < 2) {
            throw new Error("Replayer need at least 2 events.");
        }
        this.events = events;
        this.handleResize = this.handleResize.bind(this);
        var defaultConfig = {
            speed: 1,
            root: document.body,
            loadTimeout: 0,
            skipInactive: false,
            showWarning: true,
            showDebug: false,
            blockClass: "rr-block",
            liveMode: false
        };
        this.config = Object.assign({}, defaultConfig, config);
        this.timer = new Timer(this.config);
        smoothscroll.polyfill();
        this.setupDom();
        this.emitter.on("resize", this.handleResize);
    }
    Replayer.prototype.on = function (event, handler) {
        this.emitter.on(event, handler);
    };
    Replayer.prototype.setConfig = function (config) {
        var _this = this;
        Object.keys(config).forEach(function (key) {
            _this.config[key] = config[key];
        });
        if (!this.config.skipInactive) {
            this.noramlSpeed = -1;
        }
    };
    Replayer.prototype.getMetaData = function () {
        var firstEvent = this.events[0];
        var lastEvent = this.events[this.events.length - 1];
        return {
            totalTime: lastEvent.timestamp - firstEvent.timestamp
        };
    };
    Replayer.prototype.getTimeOffset = function () {
        return this.baselineTime - this.events[0].timestamp;
    };
    Replayer.prototype.play = function (timeOffset) {
        if (timeOffset === void 0) { timeOffset = 0; }
        this.timer.clear();
        this.baselineTime = this.events[0].timestamp + timeOffset;
        var actions = new Array();
        for (var _i = 0, _a = this.events; _i < _a.length; _i++) {
            var event_1 = _a[_i];
            var isSync = event_1.timestamp < this.baselineTime;
            var castFn = this.getCastFn(event_1, isSync);
            if (isSync) {
                castFn();
            }
            else {
                actions.push({ doAction: castFn, delay: this.getDelay(event_1) });
            }
        }
        this.timer.addActions(actions);
        this.timer.start();
        this.emitter.emit(ReplayerEvents.Start);
    };
    Replayer.prototype.pause = function () {
        this.timer.clear();
        this.emitter.emit(ReplayerEvents.Pause);
    };
    Replayer.prototype.resume = function (timeOffset) {
        if (timeOffset === void 0) { timeOffset = 0; }
        this.timer.clear();
        this.baselineTime = this.events[0].timestamp + timeOffset;
        var actions = new Array();
        for (var _i = 0, _a = this.events; _i < _a.length; _i++) {
            var event_2 = _a[_i];
            if (event_2.timestamp <= this.lastPlayedEvent.timestamp ||
                event_2 === this.lastPlayedEvent) {
                continue;
            }
            var castFn = this.getCastFn(event_2);
            actions.push({
                doAction: castFn,
                delay: this.getDelay(event_2)
            });
        }
        this.timer.addActions(actions);
        this.timer.start();
        this.emitter.emit(ReplayerEvents.Resume);
    };
    Replayer.prototype.addEvent = function (event) {
        var castFn = this.getCastFn(event, true);
        castFn();
    };
    Replayer.prototype.setupDom = function () {
        this.wrapper = document.createElement("div");
        this.wrapper.classList.add("replayer-wrapper");
        this.config.root.appendChild(this.wrapper);
        this.mouse = document.createElement("div");
        this.mouse.classList.add("replayer-mouse");
        this.wrapper.appendChild(this.mouse);
        this.iframe = document.createElement("iframe");
        this.iframe.setAttribute("sandbox", "allow-same-origin");
        this.iframe.setAttribute("scrolling", "no");
        this.wrapper.appendChild(this.iframe);
    };
    Replayer.prototype.handleResize = function (dimension) {
        this.iframe.width = dimension.width + "px";
        this.iframe.height = dimension.height + "px";
    };
    Replayer.prototype.getDelay = function (event) {
        if (event.type === EventType.IncrementalSnapshot &&
            event.data.source === IncrementalSource.MouseMove) {
            var firstOffset = event.data.positions[0].timeOffset;
            var firstTimestamp = event.timestamp + firstOffset;
            event.delay = firstTimestamp - this.baselineTime;
            return firstTimestamp - this.baselineTime;
        }
        event.delay = event.timestamp - this.baselineTime;
        return event.timestamp - this.baselineTime;
    };
    Replayer.prototype.getCastFn = function (event, isSync) {
        var _this = this;
        if (isSync === void 0) { isSync = false; }
        var castFn;
        switch (event.type) {
            case EventType.DomContentLoaded:
            case EventType.Load:
                break;
            case EventType.Meta:
                castFn = function () {
                    return _this.emitter.emit(ReplayerEvents.Resize, {
                        width: event.data.width,
                        height: event.data.height
                    });
                };
                break;
            case EventType.FullSnapshot:
                castFn = function () {
                    _this.rebuildFullSnapshot(event);
                    _this.iframe.contentWindow.scrollTo(event.data.initialOffset);
                };
                break;
            case EventType.IncrementalSnapshot:
                castFn = function () {
                    _this.applyIncremental(event, isSync);
                    if (event === _this.nextUserInteractionEvent) {
                        _this.nextUserInteractionEvent = null;
                        _this.restoreSpeed();
                    }
                    if (_this.config.skipInactive && !_this.nextUserInteractionEvent) {
                        for (var _i = 0, _a = _this.events; _i < _a.length; _i++) {
                            var _event = _a[_i];
                            if (_event.timestamp <= event.timestamp) {
                                continue;
                            }
                            if (_this.isUserInteraction(_event)) {
                                if (_event.delay - event.delay >
                                    SKIP_TIME_THRESHOLD * _this.config.speed) {
                                    _this.nextUserInteractionEvent = _event;
                                }
                                break;
                            }
                        }
                        if (_this.nextUserInteractionEvent) {
                            _this.noramlSpeed = _this.config.speed;
                            var skipTime = _this.nextUserInteractionEvent.delay - event.delay;
                            var payload = {
                                speed: Math.min(Math.round(skipTime / SKIP_TIME_INTERVAL), 360)
                            };
                            _this.setConfig(payload);
                            _this.emitter.emit(ReplayerEvents.SkipStart, payload);
                        }
                    }
                };
                break;
            default:
        }
        var wrappedCastFn = function () {
            if (castFn) {
                castFn();
            }
            _this.lastPlayedEvent = event;
            if (event === _this.events[_this.events.length - 1]) {
                _this.restoreSpeed();
                _this.emitter.emit(ReplayerEvents.Finish);
            }
        };
        return wrappedCastFn;
    };
    Replayer.prototype.rebuildFullSnapshot = function (event) {
        if (Object.keys(this.missingNodeRetryMap).length) {
            console.warn("Found unresolved missing node map", this.missingNodeRetryMap);
        }
        this.missingNodeRetryMap = {};
        mirror.map = rebuild(event.data.node, this.iframe.contentDocument)[1];
        var styleEl = document.createElement("style");
        var _a = this.iframe.contentDocument, documentElement = _a.documentElement, head = _a.head;
        documentElement.insertBefore(styleEl, head);
        var injectStyleRules = getInjectStyleRules(this.config.blockClass);
        for (var idx = 0; idx < injectStyleRules.length; idx++) {
            styleEl.sheet.insertRule(injectStyleRules[idx], idx);
        }
        this.emitter.emit(ReplayerEvents.FullsnapshotRebuilded);
        this.waitForStylesheetLoad();
    };
    Replayer.prototype.waitForStylesheetLoad = function () {
        var _this = this;
        var head = this.iframe.contentDocument.head;
        if (head) {
            var unloadSheets_1 = new Set();
            var timer_1;
            head
                .querySelectorAll('link[rel="stylesheet"]')
                .forEach(function (css) {
                if (!css.sheet) {
                    if (unloadSheets_1.size === 0) {
                        _this.pause();
                        _this.emitter.emit(ReplayerEvents.LoadStylesheetStart);
                        timer_1 = window.setTimeout(function () {
                            _this.resume(_this.timer.timeOffset);
                            timer_1 = -1;
                        }, _this.config.loadTimeout);
                    }
                    unloadSheets_1.add(css);
                    css.addEventListener("load", function () {
                        unloadSheets_1.delete(css);
                        if (unloadSheets_1.size === 0 && timer_1 !== -1) {
                            _this.resume(_this.timer.timeOffset);
                            _this.emitter.emit(ReplayerEvents.LoadStylesheetEnd);
                            if (timer_1) {
                                window.clearTimeout(timer_1);
                            }
                        }
                    });
                }
            });
        }
    };
    Replayer.prototype.applyIncremental = function (e, isSync) {
        var _this = this;
        var d = e.data;
        switch (d.source) {
            case IncrementalSource.Mutation: {
                d.removes.forEach(function (mutation) {
                    var target = mirror.getNode(mutation.id);
                    if (!target) {
                        return _this.warnNodeNotFound(d, mutation.id);
                    }
                    var parent = mirror.getNode(mutation.parentId);
                    if (!parent) {
                        return _this.warnNodeNotFound(d, mutation.parentId);
                    }
                    mirror.removeNodeFromMap(target);
                    if (parent) {
                        parent.removeChild(target);
                    }
                });
                var missingNodeMap_1 = __assign({}, this.missingNodeRetryMap);
                d.adds.forEach(function (mutation) {
                    var target = buildNodeWithSN(mutation.node, _this.iframe.contentDocument, mirror.map, true);
                    var parent = mirror.getNode(mutation.parentId);
                    if (!parent) {
                        return _this.warnNodeNotFound(d, mutation.parentId);
                    }
                    var previous = null;
                    var next = null;
                    if (mutation.previousId) {
                        previous = mirror.getNode(mutation.previousId);
                    }
                    if (mutation.nextId) {
                        next = mirror.getNode(mutation.nextId);
                    }
                    if (mutation.previousId === -1 || mutation.nextId === -1) {
                        missingNodeMap_1[mutation.node.id] = {
                            node: target,
                            mutation: mutation
                        };
                        return;
                    }
                    if (previous &&
                        previous.nextSibling &&
                        previous.nextSibling.parentNode) {
                        parent.insertBefore(target, previous.nextSibling);
                    }
                    else if (next && next.parentNode) {
                        parent.insertBefore(target, next);
                    }
                    else {
                        parent.appendChild(target);
                    }
                    if (mutation.previousId || mutation.nextId) {
                        _this.resolveMissingNode(missingNodeMap_1, parent, target, mutation);
                    }
                });
                if (Object.keys(missingNodeMap_1).length) {
                    Object.assign(this.missingNodeRetryMap, missingNodeMap_1);
                }
                d.texts.forEach(function (mutation) {
                    var target = mirror.getNode(mutation.id);
                    if (!target) {
                        return _this.warnNodeNotFound(d, mutation.id);
                    }
                    target.textContent = mutation.value;
                });
                d.attributes.forEach(function (mutation) {
                    var target = mirror.getNode(mutation.id);
                    if (!target) {
                        return _this.warnNodeNotFound(d, mutation.id);
                    }
                    for (var attributeName in mutation.attributes) {
                        if (typeof attributeName === "string") {
                            var value = mutation.attributes[attributeName];
                            if (value !== null) {
                                target.setAttribute(attributeName, value);
                            }
                            else {
                                target.removeAttribute(attributeName);
                            }
                        }
                    }
                });
                break;
            }
            case IncrementalSource.MouseMove:
                if (isSync) {
                    var lastPosition = d.positions[d.positions.length - 1];
                    this.moveAndHover(d, lastPosition.x, lastPosition.y, lastPosition.id);
                }
                else {
                    d.positions.forEach(function (p) {
                        var action = {
                            doAction: function () {
                                _this.moveAndHover(d, p.x, p.y, p.id);
                            },
                            delay: p.timeOffset + e.timestamp - _this.baselineTime
                        };
                        _this.timer.addAction(action);
                    });
                }
                break;
            case IncrementalSource.MouseInteraction: {
                if (d.id === -1) {
                    break;
                }
                var event_3 = new Event(MouseInteractions[d.type].toLowerCase());
                var target = mirror.getNode(d.id);
                if (!target) {
                    return this.debugNodeNotFound(d, d.id);
                }
                this.emitter.emit(ReplayerEvents.MouseInteraction, {
                    type: d.type,
                    target: target
                });
                switch (d.type) {
                    case MouseInteractions.Blur:
                        if (target.blur) {
                            target.blur();
                        }
                        break;
                    case MouseInteractions.Focus:
                        if (target.focus) {
                            target.focus({
                                preventScroll: true
                            });
                        }
                        break;
                    case MouseInteractions.Click:
                        if (!isSync) {
                            this.moveAndHover(d, d.x, d.y, d.id);
                            this.mouse.classList.remove("active");
                            void this.mouse.offsetWidth;
                            this.mouse.classList.add("active");
                        }
                        break;
                    default:
                        target.dispatchEvent(event_3);
                }
                break;
            }
            case IncrementalSource.Scroll: {
                if (d.id === -1) {
                    break;
                }
                var target = mirror.getNode(d.id);
                if (!target) {
                    return this.debugNodeNotFound(d, d.id);
                }
                if (target === this.iframe.contentDocument) {
                    this.iframe.contentWindow.scrollTo({
                        top: d.y,
                        left: d.x,
                        behavior: isSync ? "auto" : "smooth"
                    });
                }
                else {
                    try {
                        target.scrollTop = d.y;
                        target.scrollLeft = d.x;
                    }
                    catch (error) {
                    }
                }
                break;
            }
            case IncrementalSource.ViewportResize:
                this.emitter.emit(ReplayerEvents.Resize, {
                    width: d.width,
                    height: d.height
                });
                break;
            case IncrementalSource.Input: {
                if (d.id === -1) {
                    break;
                }
                var target = mirror.getNode(d.id);
                if (!target) {
                    return this.debugNodeNotFound(d, d.id);
                }
                try {
                    target.checked = d.isChecked;
                    target.value = d.text;
                }
                catch (error) {
                }
                break;
            }
            default:
        }
    };
    Replayer.prototype.resolveMissingNode = function (map, parent, target, targetMutation) {
        var previousId = targetMutation.previousId, nextId = targetMutation.nextId;
        var previousInMap = previousId && map[previousId];
        var nextInMap = nextId && map[nextId];
        if (previousInMap) {
            var _a = previousInMap, node = _a.node, mutation = _a.mutation;
            parent.insertBefore(node, target);
            delete map[mutation.node.id];
            delete this.missingNodeRetryMap[mutation.node.id];
            if (mutation.previousId || mutation.nextId) {
                this.resolveMissingNode(map, parent, node, mutation);
            }
        }
        if (nextInMap) {
            var _b = nextInMap, node = _b.node, mutation = _b.mutation;
            parent.insertBefore(node, target.nextSibling);
            delete map[mutation.node.id];
            delete this.missingNodeRetryMap[mutation.node.id];
            if (mutation.previousId || mutation.nextId) {
                this.resolveMissingNode(map, parent, node, mutation);
            }
        }
    };
    Replayer.prototype.moveAndHover = function (d, x, y, id) {
        this.mouse.style.left = x + "px";
        this.mouse.style.top = y + "px";
        var target = mirror.getNode(id);
        if (!target) {
            return this.debugNodeNotFound(d, id);
        }
        this.hoverElements(target);
    };
    Replayer.prototype.hoverElements = function (el) {
        this.iframe
            .contentDocument.querySelectorAll(".\\:hover")
            .forEach(function (hoveredEl) {
            hoveredEl.classList.remove(":hover");
        });
        var currentEl = el;
        while (currentEl) {
            currentEl.classList.add(":hover");
            currentEl = currentEl.parentElement;
        }
    };
    Replayer.prototype.isUserInteraction = function (event) {
        if (event.type !== EventType.IncrementalSnapshot) {
            return false;
        }
        return (event.data.source > IncrementalSource.Mutation &&
            event.data.source <= IncrementalSource.Input);
    };
    Replayer.prototype.restoreSpeed = function () {
        if (this.noramlSpeed === -1) {
            return;
        }
        var payload = { speed: this.noramlSpeed };
        this.setConfig(payload);
        this.emitter.emit(ReplayerEvents.SkipEnd, payload);
        this.noramlSpeed = -1;
    };
    Replayer.prototype.warnNodeNotFound = function (d, id) {
        if (!this.config.showWarning) {
            return;
        }
        console.warn(REPLAY_CONSOLE_PREFIX, "Node with id '" + id + "' not found in", d);
    };
    Replayer.prototype.debugNodeNotFound = function (d, id) {
        if (!this.config.showDebug) {
            return;
        }
        console.log(REPLAY_CONSOLE_PREFIX, "Node with id '" + id + "' not found in", d);
    };
    return Replayer;
}());
export { Replayer };
//# sourceMappingURL=index.js.map