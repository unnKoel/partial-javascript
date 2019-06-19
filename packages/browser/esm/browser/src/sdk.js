import { BehaviorClient } from './client/behavior/behaviorclient';
import { BrowserClient } from './client/exception/browserclient';
import { ScreenCapClient } from './client/screencap/screencapclient';
import { Breadcrumbs, GlobalHandlers, TryCatch, ScreenCaps } from './integrations';
import { getCurrentExceptionHub } from './hub/exceptionHub';
import { getCurrentBehaviorHub } from './hub/behaviorHub';
import { getCurrentScreenCapHub } from './hub/screencapHub';
import { FetchTransport } from './transport/transport';
import { logger } from './utils';
export * from './behaviorsdk';
export * from './exceptionsdk';
export * from './screencapsdk';
export var defaultIntegrations = [
    new TryCatch(),
    new Breadcrumbs(),
    new GlobalHandlers(),
    new ScreenCaps()
];
export var installedIntegrations = [];
export function setupIntegration(integration) {
    if (installedIntegrations.indexOf(integration.name) !== -1) {
        return;
    }
    integration.setupOnce();
    installedIntegrations.push(integration.name);
    logger.log("Integration installed: " + integration.name);
}
export function init(options) {
    if (options.defaultIntegrations === undefined) {
        options.defaultIntegrations = defaultIntegrations;
    }
    var exception = options.exception, behavior = options.behavior, screencap = options.screencap, url = options.url;
    var fetchTransport = new FetchTransport(url);
    getCurrentExceptionHub().bindClient(new BrowserClient(fetchTransport, exception));
    getCurrentBehaviorHub().bindClient(new BehaviorClient(fetchTransport, behavior));
    getCurrentScreenCapHub().bindClient(new ScreenCapClient(fetchTransport, screencap));
    options.defaultIntegrations.forEach(function (integration) {
        setupIntegration(integration);
    });
}
//# sourceMappingURL=sdk.js.map