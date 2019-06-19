import { Memo } from './memo';
export declare function fill(source: {
    [key: string]: any;
}, name: string, replacement: (...args: any[]) => any): void;
export declare function urlEncode(object: {
    [key: string]: any;
}): string;
export declare function normalizeToSize<T>(object: {
    [key: string]: any;
}, depth?: number, maxSize?: number): T;
export declare function walk(key: string, value: any, depth?: number, memo?: Memo): any;
export declare function normalize(input: any, depth?: number): any;
//# sourceMappingURL=object.d.ts.map