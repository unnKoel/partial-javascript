import { getGlobalObject } from '../utils';
import { Status } from '../types';
var global = getGlobalObject();
var FetchTransport = (function () {
    function FetchTransport(url) {
        this.url = url;
    }
    FetchTransport.prototype.sendEvent = function (event) {
        var defaultOptions = {
            body: JSON.stringify(event),
            method: 'POST',
        };
        global.fetch(this.url, defaultOptions).then(function (response) { return ({
            status: Status.fromHttpCode(response.status),
        }); });
    };
    return FetchTransport;
}());
export { FetchTransport };
//# sourceMappingURL=transport.js.map