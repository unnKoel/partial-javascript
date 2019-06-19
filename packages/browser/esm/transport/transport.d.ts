export interface Transport {
    sendEvent<E>(event: E): void;
}
export declare class FetchTransport implements Transport {
    url: string;
    constructor(url: string);
    sendEvent<E>(event: E): void;
}
//# sourceMappingURL=transport.d.ts.map