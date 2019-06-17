export * from './behaviorsdk';
export * from './exceptionsdk';
export * from './screencapsdk';

import { BehaviorClient } from './client/behavior/behaviorclient';
import { BrowserClient } from './client/exception/browserclient';
import { ScreenCapClient } from './client/screencap/screencapclient';
import { Breadcrumbs, GlobalHandlers, TryCatch } from './integrations';

import { getCurrentExceptionHub } from './hub/exceptionHub';
import { getCurrentBehaviorHub } from './hub/behaviorHub';
import { getCurrentScreenCapHub } from './hub/screencapHub';
import { Integration, Options } from './types';
import { FetchTransport } from './transport/transport';

import { BrowserOptions } from './client/exception/browserbackend';
import { logger } from './utils';


export const defaultIntegrations = [
    new TryCatch(),
    new Breadcrumbs(),
    new GlobalHandlers()
];

interface Config {
    exception: BrowserOptions,
    behavior: Options,
    screencap: Options,
    url: string,
    defaultIntegrations: Array<Integration>;
}

export const installedIntegrations: string[] = [];

/** Setup given integration */
export function setupIntegration(integration: Integration): void {
    if (installedIntegrations.indexOf(integration.name) !== -1) {
        return;
    }
    integration.setupOnce();
    installedIntegrations.push(integration.name);
    logger.log(`Integration installed: ${integration.name}`);
}

/**
 * 初始化
 */
export function init(options: Config): void {
    if (options.defaultIntegrations === undefined) {
        options.defaultIntegrations = defaultIntegrations;
    }

    // init every hubs
    const { exception, behavior, screencap, url } = options;
    const fetchTransport = new FetchTransport(url);

    getCurrentExceptionHub().bindClient(new BrowserClient(fetchTransport, exception));
    getCurrentBehaviorHub().bindClient(new BehaviorClient(fetchTransport, behavior));
    getCurrentScreenCapHub().bindClient(new ScreenCapClient(fetchTransport, screencap));

    //bootstrap defaultIntegrations
    options.defaultIntegrations.forEach(integration => {
        setupIntegration(integration);
    });
}