var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { BaseClient } from '../baseclient';
import { logger, isPrimitive } from '../../utils';
var ExceptionClient = (function (_super) {
    __extends(ExceptionClient, _super);
    function ExceptionClient(backendClass, transport, options) {
        var _this = _super.call(this, transport, options) || this;
        _this._backend = new backendClass(options);
        return _this;
    }
    ExceptionClient.prototype._getBackend = function () {
        return this._backend;
    };
    ExceptionClient.prototype.captureException = function (exception, hint, scope) {
        var _this = this;
        var eventId = hint && hint.event_id;
        this._processing = true;
        this._getBackend()
            .eventFromException(exception, hint)
            .then(function (event) { return _this.processBeforeSend(event, hint, scope); })
            .then(function (finalEvent) {
            eventId = finalEvent && finalEvent.event_id;
            _this._processing = false;
        })
            .catch(function (reason) {
            logger.error(reason);
            _this._processing = false;
        });
        return eventId;
    };
    ExceptionClient.prototype.captureMessage = function (message, level, hint, scope) {
        var _this = this;
        var eventId = hint && hint.event_id;
        this._processing = true;
        var promisedEvent = isPrimitive(message)
            ? this._getBackend().eventFromMessage("" + message, level, hint)
            : this._getBackend().eventFromException(message, hint);
        promisedEvent
            .then(function (event) { return _this.processBeforeSend(event, hint, scope); })
            .then(function (finalEvent) {
            eventId = finalEvent && finalEvent.event_id;
            _this._processing = false;
        })
            .catch(function (reason) {
            logger.error(reason);
            _this._processing = false;
        });
        return eventId;
    };
    ExceptionClient.prototype.captureEvent = function (event, hint, scope) {
        var _this = this;
        var eventId = hint && hint.event_id;
        this._processing = true;
        this.processBeforeSend(event, hint, scope)
            .then(function (finalEvent) {
            eventId = finalEvent && finalEvent.event_id;
            _this._processing = false;
        })
            .catch(function (reason) {
            logger.error(reason);
            _this._processing = false;
        });
        return eventId;
    };
    return ExceptionClient;
}(BaseClient));
export { ExceptionClient };
//# sourceMappingURL=exceptionclient.js.map