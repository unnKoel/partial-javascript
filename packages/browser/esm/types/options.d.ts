export interface Options {
    enabled?: boolean;
    beforeSend?<E, H>(event: E, hint?: H): Promise<E | null> | E | null;
}
export interface ExceptionOptions extends Options {
    ignoreErrors?: Array<string | RegExp>;
    release?: string;
    environment?: string;
    sampleRate?: number;
    attachStacktrace?: boolean;
    maxValueLength?: number;
}
//# sourceMappingURL=options.d.ts.map