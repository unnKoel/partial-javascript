import { Hub as HubInterface } from '../types';
import { Scope } from './scope';
import { Carrier, Layer } from './interfaces';
export declare const API_VERSION = 1;
export declare class Hub implements HubInterface {
    private readonly _version;
    private readonly _stack;
    constructor(scope?: Scope, client?: any, _version?: number);
    protected _invokeClient(method: string, ...args: any[]): void;
    isOlderThan(version: number): boolean;
    bindClient(client?: any): void;
    pushScope(): Scope | undefined;
    popScope(): boolean;
    withScope(callback: (scope: Scope | undefined) => void): void;
    getClient<C>(): C | undefined;
    getScope(): Scope | undefined;
    getStack(): Layer[];
    getStackTop(): Layer;
    configureScope(callback: (scope: Scope) => void): void;
}
export declare function hasHubOnCarrier<B extends Hub>(carrier: Carrier<B>, key: string): boolean;
export declare type HubClass<B extends Hub, S extends Scope> = new (scope?: S) => B;
export declare function getHubFromCarrier<B extends Hub, S extends Scope>(carrier: Carrier<B>, key: string, Hub?: HubClass<B, S>): B;
export declare function getMainCarrier<B extends Hub>(): Carrier<B>;
export declare function setHubOnCarrier<B extends Hub>(carrier: Carrier<B>, key: string, hub: B): boolean;
//# sourceMappingURL=hub.d.ts.map