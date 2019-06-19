import { Backend } from './basebackend';
import { Event, EventHint, ExceptionOptions, Severity } from '../../types';
import { SyncPromise } from '../../utils';
export interface BrowserOptions extends ExceptionOptions {
    blacklistUrls?: Array<string | RegExp>;
    whitelistUrls?: Array<string | RegExp>;
}
export declare class BrowserBackend implements Backend {
    eventFromException(exception: any, hint?: EventHint): SyncPromise<Event>;
    private _buildEvent;
    eventFromMessage(message: string, level?: Severity, hint?: EventHint): SyncPromise<Event>;
}
//# sourceMappingURL=browserbackend.d.ts.map