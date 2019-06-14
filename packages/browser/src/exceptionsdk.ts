import { getCurrentExceptionHub } from './hub/exceptionHub';
import { Hub } from './hub/hub';
import { Scope } from './hub/scope';
import { Event, Severity } from './types';

/**
 * This calls a function on the current hub.
 * @param method function to call on hub.
 * @param args to pass to function.
 */
function callOnExceptionHub<T>(method: string, ...args: any[]): T {
    const hub = getCurrentExceptionHub();
    if (hub && hub[method as keyof Hub]) {
        // tslint:disable-next-line:no-unsafe-any
        return (hub[method as keyof Hub] as any)(...args);
    }
    throw new Error(`No hub defined or ${method} was not found on the hub, please open a bug report.`);
}

/**
 * Captures an exception event and sends it to Sentry.
 *
 * @param exception An exception-like object.
 * @returns The generated eventId.
 */
export function captureException(exception: any): string {
    let syntheticException: Error;
    try {
        throw new Error('Sentry syntheticException');
    } catch (exception) {
        syntheticException = exception as Error;
    }
    return callOnExceptionHub('captureException', exception, {
        originalException: exception,
        syntheticException,
    });
}

/**
 * Captures a message event and sends it to Sentry.
 *
 * @param message The message to send to Sentry.
 * @param level Define the level of the message.
 * @returns The generated eventId.
 */
export function captureMessage(message: string, level?: Severity): string {
    let syntheticException: Error;
    try {
        throw new Error(message);
    } catch (exception) {
        syntheticException = exception as Error;
    }
    return callOnExceptionHub('captureMessage', message, level, {
        originalException: message,
        syntheticException,
    });
}

/**
 * Captures a manually created event and sends it to Sentry.
 *
 * @param event The event to send to Sentry.
 * @returns The generated eventId.
 */
export function captureEvent(event: Event): string {
    return callOnExceptionHub('captureEvent', event);
}

/**
 * Callback to set context information onto the scope.
 * @param callback Callback function that receives Scope.
 */
export function configureExceptionScope(callback: (scope: Scope) => void): void {
    callOnExceptionHub<void>('configureScope', callback);
}

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
export function withExceptionScope(callback: (scope: Scope) => void): void {
    callOnExceptionHub<void>('withScope', callback);
}

/**
 * Calls a function on the latest client. Use this with caution, it's meant as
 * in "internal" helper so we don't need to expose every possible function in
 * the shim. It is not guaranteed that the client actually implements the
 * function.
 *
 * @param method The method to call on the client/client.
 * @param args Arguments to pass to the client/fontend.
 */
export function _callOnClient(method: string, ...args: any[]): void {
    callOnExceptionHub<void>('_invokeClient', method, ...args);
}
