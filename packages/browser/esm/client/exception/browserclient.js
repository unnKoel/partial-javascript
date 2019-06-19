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
import { ExceptionClient } from './exceptionclient';
import { BrowserBackend } from './browserbackend';
var BrowserClient = (function (_super) {
    __extends(BrowserClient, _super);
    function BrowserClient(transport, options) {
        if (options === void 0) { options = {}; }
        return _super.call(this, BrowserBackend, transport, options) || this;
    }
    BrowserClient.prototype._prepareEvent = function (event, scope, hint) {
        event.platform = event.platform || 'javascript';
        return this._prepareEvent(event, scope, hint);
    };
    return BrowserClient;
}(ExceptionClient));
export { BrowserClient };
//# sourceMappingURL=browserclient.js.map