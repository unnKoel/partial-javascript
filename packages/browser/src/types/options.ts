import { Event, EventHint } from './event';

/** Base configuration options for every SDK. */
export interface ExceptionOptions {
  /**
   * Specifies whether this SDK should activate and send events to Sentry.
   * Disabling the SDK reduces all overhead from instrumentation, collecting
   * breadcrumbs and capturing events. Defaults to true.
   */
  enabled?: boolean;

  /**
   * A pattern for error messages which should not be sent to Sentry.
   * By default, all errors will be sent.
   */
  ignoreErrors?: Array<string | RegExp>;

  /**
   * The release identifier used when uploading respective source maps. Specify
   * this value to allow Sentry to resolve the correct source maps when
   * processing events.
   */
  release?: string;

  /** The current environment of your application (e.g. "production"). */
  environment?: string;

  /** A global sample rate to apply to all events (0 - 1). */
  sampleRate?: number;

  /** Attaches stacktraces to pure capture message / log integrations */
  attachStacktrace?: boolean;

  /** Maxium number of chars a single value can have before it will be truncated. */
  maxValueLength?: number;

  /**
   * A callback invoked during event submission, allowing to optionally modify
   * the event before it is sent to Sentry.
   *
   * Note that you must return a valid event from this callback. If you do not
   * wish to modify the event, simply return it at the end.
   * Returning null will case the event to be dropped.
   *
   * @param event The error or message event generated by the SDK.
   * @param hint May contain additional information about the original exception.
   * @returns A new event that will be sent | null.
   */
  beforeSend?(event: Event, hint?: EventHint): Promise<Event | null> | Event | null;
}