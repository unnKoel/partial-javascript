import { User } from './user';
import { SyncPromise } from '../utils';
import { EventBase } from './eventbase';
export interface Scope {
    addProcessor(callback: Function): this;
    setUser(user: User | null): this;
    setTags(tags: {
        [key: string]: string;
    }): this;
    setTag(key: string, value: string): this;
    setExtras(extras: {
        [key: string]: any;
    }): this;
    setExtra(key: string, extra: any): this;
    clear(): this;
    clone(): Scope;
    applyToEvent<E extends EventBase, H>(event: E, hint?: H): SyncPromise<E | null>;
}
//# sourceMappingURL=scope.d.ts.map