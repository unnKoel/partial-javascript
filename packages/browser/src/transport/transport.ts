export interface Transport {
    /** Submits the event to Sentry */
    sendEvent<E>(event: E): void;
}