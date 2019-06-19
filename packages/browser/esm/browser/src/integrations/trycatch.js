import { fill, getGlobalObject } from '../utils';
import { wrap } from './helpers';
var TryCatch = (function () {
    function TryCatch() {
        this._ignoreOnError = 0;
        this.name = TryCatch.id;
    }
    TryCatch.prototype._wrapTimeFunction = function (original) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var originalCallback = args[0];
            args[0] = wrap(originalCallback);
            return original.apply(this, args);
        };
    };
    TryCatch.prototype._wrapRAF = function (original) {
        return function (callback) {
            return original(wrap(callback));
        };
    };
    TryCatch.prototype._wrapEventTarget = function (target) {
        var global = getGlobalObject();
        var proto = global[target] && global[target].prototype;
        if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
            return;
        }
        fill(proto, 'addEventListener', function (original) {
            return function (eventName, fn, options) {
                try {
                    fn.handleEvent = wrap(fn.handleEvent.bind(fn));
                }
                catch (err) {
                }
                return original.call(this, eventName, wrap(fn), options);
            };
        });
        fill(proto, 'removeEventListener', function (original) {
            return function (eventName, fn, options) {
                var callback = fn;
                try {
                    callback = callback && (callback.__sentry_wrapped__ || callback);
                }
                catch (e) {
                }
                return original.call(this, eventName, callback, options);
            };
        });
    };
    TryCatch.prototype.setupOnce = function () {
        this._ignoreOnError = this._ignoreOnError;
        var global = getGlobalObject();
        fill(global, 'setTimeout', this._wrapTimeFunction.bind(this));
        fill(global, 'setInterval', this._wrapTimeFunction.bind(this));
        fill(global, 'requestAnimationFrame', this._wrapRAF.bind(this));
        [
            'EventTarget',
            'Window',
            'Node',
            'ApplicationCache',
            'AudioTrackList',
            'ChannelMergerNode',
            'CryptoOperation',
            'EventSource',
            'FileReader',
            'HTMLUnknownElement',
            'IDBDatabase',
            'IDBRequest',
            'IDBTransaction',
            'KeyOperation',
            'MediaController',
            'MessagePort',
            'ModalWindow',
            'Notification',
            'SVGElementInstance',
            'Screen',
            'TextTrack',
            'TextTrackCue',
            'TextTrackList',
            'WebSocket',
            'WebSocketWorker',
            'Worker',
            'XMLHttpRequest',
            'XMLHttpRequestEventTarget',
            'XMLHttpRequestUpload',
        ].forEach(this._wrapEventTarget.bind(this));
    };
    TryCatch.id = 'TryCatch';
    return TryCatch;
}());
export { TryCatch };
//# sourceMappingURL=trycatch.js.map