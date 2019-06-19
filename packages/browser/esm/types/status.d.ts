export declare enum Status {
    Unknown = "unknown",
    Skipped = "skipped",
    Success = "success",
    RateLimit = "rate_limit",
    Invalid = "invalid",
    Failed = "failed"
}
export declare namespace Status {
    function fromHttpCode(code: number): Status;
}
//# sourceMappingURL=status.d.ts.map