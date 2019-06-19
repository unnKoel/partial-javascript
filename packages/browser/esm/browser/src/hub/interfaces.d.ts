import { Hub } from './hub';
import { Scope } from './scope';
export interface Layer {
    client?: any;
    scope?: Scope;
}
export interface Carrier<B extends Hub> {
    __SENTRY__?: {
        [key: string]: B;
    };
}
//# sourceMappingURL=interfaces.d.ts.map