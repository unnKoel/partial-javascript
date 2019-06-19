export var Status;
(function (Status) {
    Status["Unknown"] = "unknown";
    Status["Skipped"] = "skipped";
    Status["Success"] = "success";
    Status["RateLimit"] = "rate_limit";
    Status["Invalid"] = "invalid";
    Status["Failed"] = "failed";
})(Status || (Status = {}));
(function (Status) {
    function fromHttpCode(code) {
        if (code >= 200 && code < 300) {
            return Status.Success;
        }
        if (code === 429) {
            return Status.RateLimit;
        }
        if (code >= 400 && code < 500) {
            return Status.Invalid;
        }
        if (code >= 500) {
            return Status.Failed;
        }
        return Status.Unknown;
    }
    Status.fromHttpCode = fromHttpCode;
})(Status || (Status = {}));
//# sourceMappingURL=status.js.map