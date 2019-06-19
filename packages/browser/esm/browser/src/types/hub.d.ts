import { Scope } from './scope';
import { Severity } from './severity';
import { Event, EventHint } from './event';
export interface Hub {
    isOlderThan(version: number): boolean;
    bindClient(client?: any): void;
    pushScope(): Scope | undefined;
    popScope(): boolean;
    withScope(callback: (scope: Scope | undefined) => void): void;
    getClient(): any;
    configureScope(callback: (scope: Scope) => void): void;
}
export interface ExceptionHub extends Hub {
    captureException(exception: any, hint?: EventHint): string;
    captureMessage(message: string, level?: Severity, hint?: EventHint): string;
    captureEvent(event: Event, hint?: EventHint): string;
    lastEventId(): string | undefined;
}
//# sourceMappingURL=hub.d.ts.map