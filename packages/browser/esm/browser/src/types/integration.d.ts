export interface IntegrationClass<T> {
    new (): T;
    id: string;
}
export interface Integration {
    name: string;
    setupOnce(): void;
}
//# sourceMappingURL=integration.d.ts.map