import { Scope } from './hub/scope';
import { Event, Severity } from './types';
export declare function captureException(exception: any): string;
export declare function captureMessage(message: string, level?: Severity): string;
export declare function captureEvent(event: Event): string;
export declare function configureExceptionScope(callback: (scope: Scope) => void): void;
export declare function withExceptionScope(callback: (scope: Scope) => void): void;
export declare function _callOnExceptionClient(method: string, ...args: any[]): void;
//# sourceMappingURL=exceptionsdk.d.ts.map