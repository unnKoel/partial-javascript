import { ExceptionClient } from './exceptionclient';
import { Transport } from '../../transport/transport';
import { Event, EventHint, Scope } from '../../types';
import { SyncPromise } from '../../utils';

import { BrowserBackend, BrowserOptions } from './browserbackend';

/**
 * Browser SDK Client.
 *
 * @see BrowserOptions for documentation on configuration options.
 */
export class BrowserClient extends ExceptionClient<BrowserBackend, BrowserOptions> {
    /**
     * Creates a new Browser SDK instance.
     *
     * @param options Configuration options for this SDK.
     */
    public constructor(transport: Transport, options: BrowserOptions = {}) {
        super(BrowserBackend, transport, options);
    }

    /**
     * @inheritDoc
     */
    protected _prepareEvent(event: Event, scope?: Scope, hint?: EventHint): SyncPromise<Event | null> {
        event.platform = event.platform || 'javascript';
        return this._prepareEvent(event, scope, hint);
    }
}
