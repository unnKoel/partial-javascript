import { Scope } from './hub/scope';
import { ScreenCapEvent } from './types';
export declare function captureScreenCap(screenCapEvent: ScreenCapEvent): string;
export declare function configureScreenCapScope(callback: (scope: Scope) => void): void;
export declare function withScreenCapScope(callback: (scope: Scope) => void): void;
export declare function _callOnScreenCapClient(method: string, ...args: any[]): void;
//# sourceMappingURL=screencapsdk.d.ts.map