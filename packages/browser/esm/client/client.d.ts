import { Scope } from '../types';
import { SyncPromise } from '../utils';
export interface Client<O, E, H> {
    getDsn(): string | undefined;
    getOptions(): O;
    processBeforeSend(event: E, hint?: H, scope?: Scope): SyncPromise<E>;
}
//# sourceMappingURL=client.d.ts.map