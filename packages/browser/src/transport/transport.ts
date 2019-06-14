export interface Transport {
    /** Submits the event to Sentry */
    sendEvent<E>(event: E): void;
}

export class DefaultTransport implements Transport {
    sendEvent<E>(event: E): void {
        throw new Error("Method not implemented.");
    }
}