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
import { SyncPromise, logger } from '../utils';
var BaseClient = (function () {
    function BaseClient(transport, options) {
        this._processing = false;
        this._options = options;
        this._transport = transport;
    }
    BaseClient.prototype._isEnabled = function () {
        return this.getOptions().enabled !== false && this._dsn !== undefined;
    };
    BaseClient.prototype._getTransport = function () {
        return this._transport;
    };
    BaseClient.prototype.getDsn = function () {
        return this._dsn;
    };
    BaseClient.prototype.getOptions = function () {
        return this._options;
    };
    BaseClient.prototype._prepareEvent = function (event, scope, hint) {
        var prepared = __assign({}, event);
        var result = SyncPromise.resolve(prepared);
        if (scope) {
            result = scope.applyToEvent(prepared, hint);
        }
        return result;
    };
    BaseClient.prototype.processBeforeSend = function (event, hint, scope) {
        var _this = this;
        var beforeSend = this.getOptions().beforeSend;
        if (!this._isEnabled()) {
            return SyncPromise.reject('SDK not enabled, will not send event.');
        }
        return new SyncPromise(function (resolve, reject) {
            _this._prepareEvent(event, scope, hint).then(function (prepared) {
                if (prepared === null) {
                    reject('An event processor returned null, will not send event.');
                    return;
                }
                var finalEvent = prepared;
                if (!beforeSend) {
                    _this._getTransport().sendEvent(finalEvent);
                    resolve(finalEvent);
                    return;
                }
                var beforeSendResult = beforeSend(prepared, hint);
                finalEvent = beforeSendResult;
                if (finalEvent === null) {
                    logger.log('`beforeSend` returned `null`, will not send event.');
                    resolve(null);
                    return;
                }
                _this._getTransport().sendEvent(finalEvent);
                resolve(finalEvent);
            });
        });
    };
    return BaseClient;
}());
export { BaseClient };
//# sourceMappingURL=baseclient.js.map