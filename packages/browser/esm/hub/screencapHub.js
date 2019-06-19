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
import { Hub as HubBase } from './hub';
import { uuid4 } from '../utils/misc';
import { getMainCarrier, hasHubOnCarrier, getHubFromCarrier, setHubOnCarrier, API_VERSION } from './hub';
var ScreenCapHub = (function (_super) {
    __extends(ScreenCapHub, _super);
    function ScreenCapHub() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScreenCapHub.prototype.lastEventId = function () {
        return this._lastEventId;
    };
    ScreenCapHub.prototype.captureScreenCap = function (screenCapEvent, hint) {
        var eventId = (this._lastEventId = uuid4());
        this._invokeClient('captureScreenCap', screenCapEvent, __assign({}, hint, { event_id: eventId }));
        return eventId;
    };
    return ScreenCapHub;
}(HubBase));
export { ScreenCapHub };
var hubName = 'exceptionhub';
export function getCurrentScreenCapHub() {
    var registry = getMainCarrier();
    if (!hasHubOnCarrier(registry, hubName) || getHubFromCarrier(registry, hubName, ScreenCapHub).isOlderThan(API_VERSION)) {
        setHubOnCarrier(registry, hubName, new ScreenCapHub());
    }
    return getHubFromCarrier(registry, hubName);
}
//# sourceMappingURL=screencapHub.js.map