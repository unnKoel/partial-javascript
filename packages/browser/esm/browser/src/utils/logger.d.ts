declare class Logger {
    private _enabled;
    constructor();
    disable(): void;
    enable(): void;
    log(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}
declare const logger: Logger;
export { logger };
//# sourceMappingURL=logger.d.ts.map