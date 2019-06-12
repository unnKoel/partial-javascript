import { Dsn } from './dsn';
import { Event, EventHint } from './event';
import { Integration, IntegrationClass } from './integration';
import { Options } from './options';
import { Scope } from './scope';
import { Severity } from './severity';

/**
 * User-Facing Sentry SDK Client.
 *
 * This interface contains all methods to interface with the SDK once it has
 * been installed. It allows to send events to Sentry, record breadcrumbs and
 * set a context included in every event. Since the SDK mutates its environment,
 * there will only be one instance during runtime.
 *
 */
export interface Client<O extends Options = Options> {
  /** Returns the current Dsn. */
  getDsn(): Dsn | undefined;

  /** Returns the current options. */
  getOptions(): O;

  /**
   * A promise that resolves when all current events have been sent.
   * If you provide a timeout and the queue takes longer to drain the promise returns false.
   *
   * @param timeout Maximum time in ms the client should wait.
   */
  close(timeout?: number): Promise<boolean>;

  /**
   * A promise that resolves when all current events have been sent.
   * If you provide a timeout and the queue takes longer to drain the promise returns false.
   *
   * @param timeout Maximum time in ms the client should wait.
   */
  flush(timeout?: number): Promise<boolean>;

  /** Returns an array of installed integrations on the client. */
  getIntegration<T extends Integration>(integartion: IntegrationClass<T>): T | null;
}
