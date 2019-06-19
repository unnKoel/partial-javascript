export interface StackFrame {
    url: string;
    func: string;
    args: string[];
    line: number;
    column: number;
    context: string[];
}
export interface StackTrace {
    mode: string;
    mechanism: string;
    name: string;
    message: string;
    url: string;
    stack: StackFrame[];
    useragent: string;
    original?: string;
}
interface ComputeStackTrace {
    (ex: Error, depth?: string | number): StackTrace;
}
declare const _subscribe: any;
declare const _installGlobalHandler: any;
declare const _installGlobalUnhandledRejectionHandler: any;
declare const _computeStackTrace: ComputeStackTrace;
export { _subscribe, _installGlobalHandler, _installGlobalUnhandledRejectionHandler, _computeStackTrace };
//# sourceMappingURL=tracekit.d.ts.map