import { Scope } from './hub/scope';
import { Breadcrumb } from './types';
export declare function captureBehavior(breadcrumb: Breadcrumb): string;
export declare function configureBehaviorScope(callback: (scope: Scope) => void): void;
export declare function withBehaviorScope(callback: (scope: Scope) => void): void;
export declare function _callOnBehaviorClient(method: string, ...args: any[]): void;
//# sourceMappingURL=behaviorsdk.d.ts.map