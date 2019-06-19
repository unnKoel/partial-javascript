declare type HandlerOnSuccess<T, U = any> = (value: T) => U | Thenable<U>;
declare type HandlerOnFail<U = any> = (reason: any) => U | Thenable<U>;
interface Thenable<T> {
    then<U>(onSuccess?: HandlerOnSuccess<T, U>, onFail?: HandlerOnFail<U> | ((reason: any) => void)): Thenable<U>;
}
declare type Resolve<R> = (value?: R | Thenable<R> | any) => void;
declare type Reject = (value?: any) => void;
export declare class SyncPromise<T> implements PromiseLike<T> {
    private _state;
    private _handlers;
    private _value;
    constructor(callback: (resolve: Resolve<T>, reject: Reject) => void);
    private readonly _resolve;
    private readonly _reject;
    private readonly _setResult;
    private readonly _executeHandlers;
    private readonly _attachHandler;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): SyncPromise<TResult1 | TResult2>;
    catch<U>(onFail: HandlerOnFail<U>): SyncPromise<U>;
    toString(): string;
    static resolve<U>(value?: U | Thenable<U>): SyncPromise<U>;
    static reject<U>(reason?: any): SyncPromise<U>;
}
export {};
//# sourceMappingURL=syncpromise.d.ts.map