import { getCurrentExceptionHub } from './hub/exceptionHub';
import { getCurrentBehaviorHub } from './hub/behaviorHub';
import { getCurrentScreenCapHub } from './hub/screencapHub';
import { Hub } from './hub/hub';
import { Scope } from './hub/scope';
import { Breadcrumb, Event, Severity } from '@sentry/types';

/**
 * 初始化
 */
export function init(options: Object = {}): void {
    if (options.defaultIntegrations === undefined) {
        options.defaultIntegrations = defaultIntegrations;
    }
    initAndBind(BrowserClient, options);
}