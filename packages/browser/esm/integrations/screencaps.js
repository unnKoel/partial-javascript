import { record } from '@partial/rrweb';
import { getCurrentScreenCapHub } from '../hub/screencapHub';
var ScreenCaps = (function () {
    function ScreenCaps() {
        this.name = ScreenCaps.id;
    }
    ScreenCaps.prototype.setupOnce = function () {
        record({
            emit: function (event) {
                getCurrentScreenCapHub().captureScreenCap(event);
            },
        });
    };
    ScreenCaps.id = 'ScreenCaps';
    return ScreenCaps;
}());
export { ScreenCaps };
//# sourceMappingURL=screencaps.js.map