import { Event, EventHint, ExceptionOptions, Severity } from '../../types';
import { SyncPromise } from '../../utils';
export interface Backend {
    eventFromException(exception: any, hint?: EventHint): SyncPromise<Event>;
    eventFromMessage(message: string, level?: Severity, hint?: EventHint): SyncPromise<Event>;
}
export declare type BackendClass<B extends Backend, O extends ExceptionOptions> = new (options: O) => B;
//# sourceMappingURL=basebackend.d.ts.map