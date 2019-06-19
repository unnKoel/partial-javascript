import { Stacktrace } from './stacktrace';
export interface Exception {
    type?: string;
    value?: string;
    module?: string;
    thread_id?: number;
    stacktrace?: Stacktrace;
}
//# sourceMappingURL=exception.d.ts.map