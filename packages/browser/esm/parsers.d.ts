import { Event, Exception, StackFrame } from './types';
import { StackFrame as TraceKitStackFrame, StackTrace as TraceKitStackTrace } from './tracekit';
export declare function exceptionFromStacktrace(stacktrace: TraceKitStackTrace): Exception;
export declare function eventFromPlainObject(exception: {}, syntheticException: Error | null): Event;
export declare function eventFromStacktrace(stacktrace: TraceKitStackTrace): Event;
export declare function prepareFramesForEvent(stack: TraceKitStackFrame[]): StackFrame[];
//# sourceMappingURL=parsers.d.ts.map