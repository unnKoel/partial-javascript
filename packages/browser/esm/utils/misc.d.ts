import { Event } from '../types';
interface SentryGlobal {
    __SENTRY__: {
        globalEventProcessors: any;
        hub: any;
        logger: any;
    };
}
export declare function dynamicRequire(mod: any, request: string): any;
export declare function isNodeEnv(): boolean;
export declare function getGlobalObject<T>(): T & SentryGlobal;
export declare function uuid4(): string;
export declare function parseUrl(url: string): {
    host?: string;
    path?: string;
    protocol?: string;
    relative?: string;
};
export declare function getEventDescription(event: Event): string;
export declare function consoleSandbox(callback: () => any): any;
export declare function addExceptionTypeValue(event: Event, value?: string, type?: string): void;
export {};
//# sourceMappingURL=misc.d.ts.map