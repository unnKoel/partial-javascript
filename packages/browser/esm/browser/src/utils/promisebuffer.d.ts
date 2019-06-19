export declare class PromiseBuffer<T> {
    protected _limit?: number | undefined;
    constructor(_limit?: number | undefined);
    private readonly _buffer;
    isReady(): boolean;
    add(task: Promise<T>): Promise<T>;
    remove(task: Promise<T>): Promise<T>;
    length(): number;
    drain(timeout?: number): Promise<boolean>;
}
//# sourceMappingURL=promisebuffer.d.ts.map