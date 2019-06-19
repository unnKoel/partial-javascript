import { Breadcrumb, BreadcrumbHint, Integration } from '../types';
export interface SentryWrappedXMLHttpRequest extends XMLHttpRequest {
    [key: string]: any;
    __sentry_xhr__?: {
        method?: string;
        url?: string;
        status_code?: number;
    };
}
interface BreadcrumbIntegrations {
    console?: boolean;
    dom?: boolean;
    fetch?: boolean;
    history?: boolean;
    sentry?: boolean;
    xhr?: boolean;
}
export declare class Breadcrumbs implements Integration {
    name: string;
    static id: string;
    private readonly _options;
    constructor(options?: BreadcrumbIntegrations);
    private _instrumentConsole;
    private _instrumentDOM;
    private _instrumentFetch;
    private _instrumentHistory;
    private _instrumentXHR;
    static addBreadcrumb(breadcrumb: Breadcrumb, hint?: BreadcrumbHint): void;
    setupOnce(): void;
}
export {};
//# sourceMappingURL=breadcrumbs.d.ts.map