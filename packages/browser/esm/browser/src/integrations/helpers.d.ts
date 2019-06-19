import { WrappedFunction } from '../types';
export declare function shouldIgnoreOnError(): boolean;
export declare function ignoreNextOnError(): void;
export declare function wrap(fn: WrappedFunction, options?: {
    capture?: boolean;
}, before?: WrappedFunction): any;
export declare function breadcrumbEventHandler(eventName: string, debounce?: boolean): (event: Event) => void;
export declare function keypressEventHandler(): (event: Event) => void;
//# sourceMappingURL=helpers.d.ts.map