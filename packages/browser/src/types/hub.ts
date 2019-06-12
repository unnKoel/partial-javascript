import { Client } from '../client/client';
import { Scope } from './scope';
import { Severity } from './severity';
import { EventHint } from './event';

/**
 * Internal class used to make sure we always have the latest internal functions
 * working in case we have a version conflict.
 */
export interface Hub {
  /**
   * Checks if this hub's version is older than the given version.
   *
   * @param version A version number to compare to.
   * @return True if the given version is newer; otherwise false.
   *
   * @hidden
   */
  isOlderThan(version: number): boolean;

  /**
   * This binds the given client to the current scope.
   * @param client An SDK client (client) instance.
   */
  bindClient(client?: Client<any>): void;

  /**
   * Create a new scope to store context information.
   *
   * The scope will be layered on top of the current one. It is isolated, i.e. all
   * breadcrumbs and context information added to this scope will be removed once
   * the scope ends. Be sure to always remove this scope with {@link this.popScope}
   * when the operation finishes or throws.
   *
   * @returns Scope, the new cloned scope
   */
  pushScope(): Scope | undefined;

  /**
   * Removes a previously pushed scope from the stack.
   *
   * This restores the state before the scope was pushed. All breadcrumbs and
   * context information added since the last call to {@link this.pushScope} are
   * discarded.
   */
  popScope(): boolean;

  /**
   * Creates a new scope with and executes the given operation within.
   * The scope is automatically removed once the operation
   * finishes or throws.
   *
   * This is essentially a convenience function for:
   *
   *     pushScope();
   *     callback();
   *     popScope();
   *
   * @param callback that will be enclosed into push/popScope.
   */
  withScope(callback: (scope: Scope | undefined) => void): void;

  /** Returns the client of the top stack. */
  getClient(): Client<any> | undefined;

  /**
 * This is the getter for lastEventId.
 *
 * @returns The last event id of a captured event.
 */
  lastEventId(): string | undefined;

  /**
   * Callback to set context information onto the scope.
   *
   * @param callback Callback function that receives Scope.
   */
  configureScope(callback: (scope: Scope) => void): void;
}

export interface ExceptionHub extends Hub {
  /**
     * Captures an exception event and sends it to Sentry.
     *
     * @param exception An exception-like object.
     * @param hint May contain additional information about the original exception.
     * @returns The generated eventId.
     */
  captureException(exception: any, hint?: EventHint): string;

  /**
   * Captures a message event and sends it to Sentry.
   *
   * @param message The message to send to Sentry.
   * @param level Define the level of the message.
   * @param hint May contain additional information about the original exception.
   * @returns The generated eventId.
   */
  captureMessage(message: string, level?: Severity, hint?: EventHint): string;

  /**
   * Captures a manually created event and sends it to Sentry.
   *
   * @param event The event to send to Sentry.
   * @param hint May contain additional information about the original exception.
   */
  captureEvent(event: Event, hint?: EventHint): string;
}