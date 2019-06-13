import { Scope } from '../types';
import { SyncPromise } from '../utils';

export interface Client<O, E, H> {
    /** Returns the current Dsn. */
    getDsn(): string | undefined;

    /** Returns the current options. */
    getOptions(): O;

    /**
     * process event before send to server.
     * @param event every type's event
     * @param hint some event hint
     * @param scope user config context
     */
    processBeforeSend(event: E, hint?: H, scope?: Scope): SyncPromise<E>;
}
