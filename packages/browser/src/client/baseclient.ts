import { Client } from './client';
import { Scope, Options } from '../types';
import { Transport } from '../transport/transport';
import { SyncPromise, logger } from '../utils';
import { EventBase } from 'src/types/eventbase';

export class BaseClient<O extends Options, E extends EventBase, H> implements Client<O, E, H> {
    /** Options passed to the SDK. */
    protected readonly _options: O;

    /** The client Dsn, if specified in options. Without this Dsn, the SDK will be disabled. */
    protected readonly _dsn?: string | undefined;

    /** Is the client still processing a call? */
    protected _processing: boolean = false;

    /** backend for sending event to log server */
    protected _transport: Transport;

    protected constructor(transport: Transport, options: O) {
        this._options = options;
        this._transport = transport;
    }

    /** Determines whether this SDK is enabled and a valid Dsn is present. */
    protected _isEnabled(): boolean {
        return this.getOptions().enabled !== false && this._dsn !== undefined;
    }

    protected _getTransport(): Transport {
        return this._transport;
    }

    getDsn(): string | undefined {
        return this._dsn;
    }

    getOptions(): O {
        return this._options;
    }

    protected _prepareEvent(event: E, scope?: Scope, hint?: H): SyncPromise<E | null> {
        const prepared: E = { ...event };

        // We prepare the result here with a resolved Event.
        let result = SyncPromise.resolve<E | null>(prepared);

        // This should be the last thing called, since we want that
        // {@link Hub.addEventProcessor} gets the finished prepared event.
        if (scope) {
            // In case we have a hub we reassign it.
            result = scope.applyToEvent(prepared, hint);
        }

        return result;
    }

    processBeforeSend(event: E, hint?: H | undefined, scope?: Scope | undefined): SyncPromise<E> {
        const { beforeSend } = this.getOptions();

        if (!this._isEnabled()) {
            return SyncPromise.reject('SDK not enabled, will not send event.');
        }

        return new SyncPromise((resolve, reject) => {
            this._prepareEvent(event, scope, hint).then(prepared => {
                if (prepared === null) {
                    reject('An event processor returned null, will not send event.');
                    return;
                }

                let finalEvent: E | null = prepared;

                if (!beforeSend) {
                    this._getTransport().sendEvent(finalEvent);
                    resolve(finalEvent);
                    return;
                }
                const beforeSendResult = beforeSend(prepared, hint);
                finalEvent = beforeSendResult as E | null;

                if (finalEvent === null) {
                    logger.log('`beforeSend` returned `null`, will not send event.');
                    resolve(null);
                    return;
                }

                // From here on we are really async
                this._getTransport().sendEvent(finalEvent);
                resolve(finalEvent);
            })
        })
    }
}