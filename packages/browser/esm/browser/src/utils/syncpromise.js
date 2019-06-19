import { isThenable } from './is';
var States;
(function (States) {
    States["PENDING"] = "PENDING";
    States["RESOLVED"] = "RESOLVED";
    States["REJECTED"] = "REJECTED";
})(States || (States = {}));
var SyncPromise = (function () {
    function SyncPromise(callback) {
        var _this = this;
        this._state = States.PENDING;
        this._handlers = [];
        this._resolve = function (value) {
            _this._setResult(value, States.RESOLVED);
        };
        this._reject = function (reason) {
            _this._setResult(reason, States.REJECTED);
        };
        this._setResult = function (value, state) {
            if (_this._state !== States.PENDING) {
                return;
            }
            if (isThenable(value)) {
                value.then(_this._resolve, _this._reject);
                return;
            }
            _this._value = value;
            _this._state = state;
            _this._executeHandlers();
        };
        this._executeHandlers = function () {
            if (_this._state === States.PENDING) {
                return;
            }
            if (_this._state === States.REJECTED) {
                _this._handlers.forEach(function (h) { return h.onFail && h.onFail(_this._value); });
            }
            else {
                _this._handlers.forEach(function (h) { return h.onSuccess && h.onSuccess(_this._value); });
            }
            _this._handlers = [];
            return;
        };
        this._attachHandler = function (handler) {
            _this._handlers = _this._handlers.concat(handler);
            _this._executeHandlers();
        };
        try {
            callback(this._resolve, this._reject);
        }
        catch (e) {
            this._reject(e);
        }
    }
    SyncPromise.prototype.then = function (onfulfilled, onrejected) {
        var _this = this;
        return new SyncPromise(function (resolve, reject) {
            _this._attachHandler({
                onFail: function (reason) {
                    if (!onrejected) {
                        reject(reason);
                        return;
                    }
                    try {
                        resolve(onrejected(reason));
                        return;
                    }
                    catch (e) {
                        reject(e);
                        return;
                    }
                },
                onSuccess: function (result) {
                    if (!onfulfilled) {
                        resolve(result);
                        return;
                    }
                    try {
                        resolve(onfulfilled(result));
                        return;
                    }
                    catch (e) {
                        reject(e);
                        return;
                    }
                },
            });
        });
    };
    SyncPromise.prototype.catch = function (onFail) {
        return this.then(function (val) { return val; }, onFail);
    };
    SyncPromise.prototype.toString = function () {
        return "[object SyncPromise]";
    };
    SyncPromise.resolve = function (value) {
        return new SyncPromise(function (resolve) {
            resolve(value);
        });
    };
    SyncPromise.reject = function (reason) {
        return new SyncPromise(function (_, reject) {
            reject(reason);
        });
    };
    return SyncPromise;
}());
export { SyncPromise };
//# sourceMappingURL=syncpromise.js.map