import { ExceptionClient } from './exceptionclient';
import { Transport } from '../../transport/transport';
import { Event, EventHint, Scope } from '../../types';
import { SyncPromise } from '../../utils';
import { BrowserBackend, BrowserOptions } from './browserbackend';
export declare class BrowserClient extends ExceptionClient<BrowserBackend, BrowserOptions> {
    constructor(transport: Transport, options?: BrowserOptions);
    protected _prepareEvent(event: Event, scope?: Scope, hint?: EventHint): SyncPromise<Event | null>;
}
//# sourceMappingURL=browserclient.d.ts.map