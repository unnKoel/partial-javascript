import { Integration } from '../types';
interface GlobalHandlersIntegrations {
    onerror: boolean;
    onunhandledrejection: boolean;
}
export declare class GlobalHandlers implements Integration {
    name: string;
    static id: string;
    private readonly _options;
    constructor(options?: GlobalHandlersIntegrations);
    setupOnce(): void;
    private _eventFromGlobalHandler;
}
export {};
//# sourceMappingURL=globalhandlers.d.ts.map