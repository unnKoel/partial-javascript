export interface Client<O> {
    /** Returns the current Dsn. */
    getDsn(): string | undefined;

    /** Returns the current options. */
    getOptions(): O;
}
