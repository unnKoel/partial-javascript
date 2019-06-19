import { Integration } from '../types';
export declare class TryCatch implements Integration {
    private _ignoreOnError;
    name: string;
    static id: string;
    private _wrapTimeFunction;
    private _wrapRAF;
    private _wrapEventTarget;
    setupOnce(): void;
}
//# sourceMappingURL=trycatch.d.ts.map