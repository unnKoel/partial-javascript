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
import { logger } from '../../utils';
var ScreenCapClient = (function (_super) {
    __extends(ScreenCapClient, _super);
    function ScreenCapClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScreenCapClient.prototype.captureScreenCap = function (event, hint, scope) {
        var _this = this;
        var eventId = hint && hint.event_id;
        this._processing = true;
        this.processBeforeSend(event, hint, scope).then(function (finalEvent) {
            eventId = finalEvent && finalEvent.event_id;
            _this._processing = false;
        }).catch(function (reason) {
            logger.error(reason);
            _this._processing = false;
        });
        return eventId;
    };
    return ScreenCapClient;
}(BaseClient));
export { ScreenCapClient };
//# sourceMappingURL=screencapclient.js.map