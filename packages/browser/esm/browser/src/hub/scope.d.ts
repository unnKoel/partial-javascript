import { Scope as ScopeInterface, User } from '../types';
import { SyncPromise } from '../utils';
import { EventBase } from '../types/eventbase';
export declare class Scope implements ScopeInterface {
    protected _notifyingListeners: boolean;
    protected _scopeListeners: Array<(scope: Scope) => void>;
    protected _processors: Function[];
    protected _user: User;
    protected _tags: {
        [key: string]: string;
    };
    protected _extra: {
        [key: string]: any;
    };
    addScopeListener(callback: (scope: Scope) => void): void;
    addProcessor(callback: Function): this;
    clone(): Scope;
    protected _notifyScopeListeners(): void;
    protected _notifyProcessors<E, H>(processors: Function[], event: E, hint: H, index?: number): SyncPromise<E | null>;
    setUser(user: User | null): this;
    setTags(tags: {
        [key: string]: string;
    }): this;
    setTag(key: string, value: string): this;
    setExtras(extra: {
        [key: string]: any;
    }): this;
    setExtra(key: string, extra: any): this;
    clear(): this;
    applyToEvent<E extends EventBase, H>(event: E, hint?: H | undefined): SyncPromise<E | null>;
}
//# sourceMappingURL=scope.d.ts.map