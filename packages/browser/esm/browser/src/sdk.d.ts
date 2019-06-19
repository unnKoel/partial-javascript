import { Breadcrumbs, GlobalHandlers, TryCatch, ScreenCaps } from './integrations';
import { Integration, Options } from './types';
import { BrowserOptions } from './client/exception/browserbackend';
export * from './behaviorsdk';
export * from './exceptionsdk';
export * from './screencapsdk';
export declare const defaultIntegrations: (GlobalHandlers | TryCatch | Breadcrumbs | ScreenCaps)[];
export interface Config {
    exception: BrowserOptions;
    behavior: Options;
    screencap: Options;
    url: string;
    defaultIntegrations: Array<Integration>;
}
export declare const installedIntegrations: string[];
export declare function setupIntegration(integration: Integration): void;
export declare function init(options: Config): void;
//# sourceMappingURL=sdk.d.ts.map