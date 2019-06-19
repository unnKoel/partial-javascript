import { getGlobalObject } from './misc';
export function supportsErrorEvent() {
    try {
        new ErrorEvent('');
        return true;
    }
    catch (e) {
        return false;
    }
}
export function supportsDOMError() {
    try {
        new DOMError('');
        return true;
    }
    catch (e) {
        return false;
    }
}
export function supportsDOMException() {
    try {
        new DOMException('');
        return true;
    }
    catch (e) {
        return false;
    }
}
export function supportsFetch() {
    if (!('fetch' in getGlobalObject())) {
        return false;
    }
    try {
        new Headers();
        new Request('');
        new Response();
        return true;
    }
    catch (e) {
        return false;
    }
}
export function supportsNativeFetch() {
    if (!supportsFetch()) {
        return false;
    }
    var global = getGlobalObject();
    return global.fetch.toString().indexOf('native') !== -1;
}
export function supportsReportingObserver() {
    return 'ReportingObserver' in getGlobalObject();
}
export function supportsReferrerPolicy() {
    if (!supportsFetch()) {
        return false;
    }
    try {
        new Request('_', {
            referrerPolicy: 'origin',
        });
        return true;
    }
    catch (e) {
        return false;
    }
}
export function supportsHistory() {
    var global = getGlobalObject();
    var chrome = global.chrome;
    var isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
    var hasHistoryApi = 'history' in global && !!global.history.pushState && !!global.history.replaceState;
    return !isChromePackagedApp && hasHistoryApi;
}
//# sourceMappingURL=supports.js.map