import { Client } from './client';
import { Scope, Options } from '../types';
import { Transport } from '../transport/transport';
import { SyncPromise } from '../utils';
import { EventBase } from '../types/eventbase';
export declare class BaseClient<O extends Options, E extends EventBase, H> implements Client<O, E, H> {
    protected readonly _options: O;
    protected readonly _dsn?: string | undefined;
    protected _processing: boolean;
    protected _transport: Transport;
    constructor(transport: Transport, options: O);
    protected _isEnabled(): boolean;
    protected _getTransport(): Transport;
    getDsn(): string | undefined;
    getOptions(): O;
    protected _prepareEvent(event: E, scope?: Scope, hint?: H): SyncPromise<E | null>;
    processBeforeSend(event: E, hint?: H | undefined, scope?: Scope | undefined): SyncPromise<E>;
}
//# sourceMappingURL=baseclient.d.ts.map