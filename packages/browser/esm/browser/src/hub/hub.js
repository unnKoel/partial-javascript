import { Scope } from './scope';
import { getGlobalObject } from '../utils';
export var API_VERSION = 1;
var Hub = (function () {
    function Hub(scope, client, _version) {
        if (scope === void 0) { scope = new Scope(); }
        if (_version === void 0) { _version = API_VERSION; }
        this._version = _version;
        this._stack = [];
        this._stack.push({ client: client, scope: scope });
    }
    Hub.prototype._invokeClient = function (method) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var top = this.getStackTop();
        if (top && top.client && top.client[method]) {
            (_a = top.client)[method].apply(_a, args.concat([top.scope]));
        }
    };
    Hub.prototype.isOlderThan = function (version) {
        return this._version < version;
    };
    Hub.prototype.bindClient = function (client) {
        var top = this.getStackTop();
        top.client = client;
    };
    Hub.prototype.pushScope = function () {
        var stack = this.getStack();
        var parentScope = stack.length > 0 ? stack[stack.length - 1].scope : undefined;
        var scope = parentScope ? parentScope.clone() : undefined;
        this.getStack().push({
            client: this.getClient(),
            scope: scope,
        });
        return scope;
    };
    Hub.prototype.popScope = function () {
        return this.getStack().pop() !== undefined;
    };
    Hub.prototype.withScope = function (callback) {
        var scope = this.pushScope();
        try {
            callback(scope);
        }
        finally {
            this.popScope();
        }
    };
    Hub.prototype.getClient = function () {
        return this.getStackTop().client;
    };
    Hub.prototype.getScope = function () {
        return this.getStackTop().scope;
    };
    Hub.prototype.getStack = function () {
        return this._stack;
    };
    Hub.prototype.getStackTop = function () {
        return this._stack[this._stack.length - 1];
    };
    Hub.prototype.configureScope = function (callback) {
        var top = this.getStackTop();
        if (top.scope && top.client) {
            callback(top.scope);
        }
    };
    return Hub;
}());
export { Hub };
export function hasHubOnCarrier(carrier, key) {
    if (carrier && carrier.__SENTRY__ && carrier.__SENTRY__[key]) {
        return true;
    }
    return false;
}
export function getHubFromCarrier(carrier, key, Hub) {
    if (carrier && carrier.__SENTRY__ && carrier.__SENTRY__[key]) {
        return carrier.__SENTRY__[key];
    }
    carrier.__SENTRY__ = carrier.__SENTRY__ || {};
    if (Hub)
        carrier.__SENTRY__.hub = new Hub();
    return carrier.__SENTRY__.hub;
}
export function getMainCarrier() {
    var carrier = getGlobalObject();
    carrier.__SENTRY__ = carrier.__SENTRY__ || {};
    return carrier;
}
export function setHubOnCarrier(carrier, key, hub) {
    if (!carrier) {
        return false;
    }
    carrier.__SENTRY__ = carrier.__SENTRY__ || {};
    carrier.__SENTRY__[key] = hub;
    return true;
}
//# sourceMappingURL=hub.js.map