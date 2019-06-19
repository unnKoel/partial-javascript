import { consoleSandbox, getGlobalObject } from './misc';
var global = getGlobalObject();
var PREFIX = 'Sentry Logger ';
var Logger = (function () {
    function Logger() {
        this._enabled = false;
    }
    Logger.prototype.disable = function () {
        this._enabled = false;
    };
    Logger.prototype.enable = function () {
        this._enabled = true;
    };
    Logger.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this._enabled) {
            return;
        }
        consoleSandbox(function () {
            global.console.log(PREFIX + "[Log]: " + args.join(' '));
        });
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this._enabled) {
            return;
        }
        consoleSandbox(function () {
            global.console.warn(PREFIX + "[Warn]: " + args.join(' '));
        });
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this._enabled) {
            return;
        }
        consoleSandbox(function () {
            global.console.error(PREFIX + "[Error]: " + args.join(' '));
        });
    };
    return Logger;
}());
global.__SENTRY__ = global.__SENTRY__ || {};
var logger = global.__SENTRY__.logger || (global.__SENTRY__.logger = new Logger());
export { logger };
//# sourceMappingURL=logger.js.map