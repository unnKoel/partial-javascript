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
import { isThenable, normalize, SyncPromise } from '../utils';
var Scope = (function () {
    function Scope() {
        this._notifyingListeners = false;
        this._scopeListeners = [];
        this._processors = [];
        this._user = {};
        this._tags = {};
        this._extra = {};
    }
    Scope.prototype.addScopeListener = function (callback) {
        this._scopeListeners.push(callback);
    };
    Scope.prototype.addProcessor = function (callback) {
        this._processors.push(callback);
        return this;
    };
    Scope.prototype.clone = function () {
        var newScope = new Scope();
        Object.assign(newScope, this, {
            _scopeListeners: [],
        });
        newScope._tags = __assign({}, this._tags);
        newScope._extra = __assign({}, this._extra);
        newScope._user = this._user;
        newScope._processors = this._processors.slice();
        return newScope;
    };
    Scope.prototype._notifyScopeListeners = function () {
        var _this = this;
        if (!this._notifyingListeners) {
            this._notifyingListeners = true;
            setTimeout(function () {
                _this._scopeListeners.forEach(function (callback) {
                    callback(_this);
                });
                _this._notifyingListeners = false;
            });
        }
    };
    Scope.prototype._notifyProcessors = function (processors, event, hint, index) {
        var _this = this;
        if (index === void 0) { index = 0; }
        return new SyncPromise(function (resolve, reject) {
            var processor = processors[index];
            if (event === null || typeof processor !== 'function') {
                resolve(event);
            }
            else {
                var result = processor(event, hint);
                if (isThenable(result)) {
                    result
                        .then(function (final) { return _this._notifyProcessors(processors, final, hint, index + 1).then(resolve); })
                        .catch(reject);
                }
                else {
                    _this._notifyProcessors(processors, result, hint, index + 1)
                        .then(resolve)
                        .catch(reject);
                }
            }
        });
    };
    Scope.prototype.setUser = function (user) {
        this._user = normalize(user);
        this._notifyScopeListeners();
        return this;
    };
    Scope.prototype.setTags = function (tags) {
        this._tags = __assign({}, this._tags, normalize(tags));
        this._notifyScopeListeners();
        return this;
    };
    Scope.prototype.setTag = function (key, value) {
        var _a;
        this._tags = __assign({}, this._tags, (_a = {}, _a[key] = normalize(value), _a));
        this._notifyScopeListeners();
        return this;
    };
    Scope.prototype.setExtras = function (extra) {
        this._extra = __assign({}, this._extra, normalize(extra));
        this._notifyScopeListeners();
        return this;
    };
    Scope.prototype.setExtra = function (key, extra) {
        var _a;
        this._extra = __assign({}, this._extra, (_a = {}, _a[key] = normalize(extra), _a));
        this._notifyScopeListeners();
        return this;
    };
    Scope.prototype.clear = function () {
        this._tags = {};
        this._extra = {};
        this._user = {};
        this._notifyScopeListeners();
        return this;
    };
    Scope.prototype.applyToEvent = function (event, hint) {
        if (this._extra && Object.keys(this._extra).length) {
            event.extra = __assign({}, this._extra, event.extra);
        }
        if (this._tags && Object.keys(this._tags).length) {
            event.tags = __assign({}, this._tags, event.tags);
        }
        if (this._user && Object.keys(this._user).length) {
            event.user = __assign({}, this._user, event.user);
        }
        return this._notifyProcessors(this._processors.slice(), event, hint);
    };
    return Scope;
}());
export { Scope };
//# sourceMappingURL=scope.js.map