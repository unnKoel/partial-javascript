import { getGlobalObject } from '../utils';
import { Status } from '../types';

export interface Transport {
    /** Submits the event to Sentry */
    sendEvent<E>(event: E): void;
}

const global = getGlobalObject<Window>();

/** `fetch` based transport */
export class FetchTransport implements Transport {

    constructor(public url: string) { }

    /**
     * @inheritDoc
     */
    sendEvent<E>(event: E): void {
        const defaultOptions: RequestInit = {
            body: JSON.stringify(event),
            method: 'POST',
        };

        global.fetch(this.url, defaultOptions).then(response => ({
            status: Status.fromHttpCode(response.status),
        }));
    }
}