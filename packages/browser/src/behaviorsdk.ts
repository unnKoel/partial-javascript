import { getCurrentBehaviorHub } from './hub/behaviorHub';
import { Hub } from './hub/hub';
import { Scope } from './hub/scope';
import { Breadcrumb } from './types';

/**
 * This calls a function on the current hub.
 * @param method function to call on hub.
 * @param args to pass to function.
 */
function callOnBehaviorHub<T>(method: string, ...args: any[]): T {
    const hub = getCurrentBehaviorHub();
    if (hub && hub[method as keyof Hub]) {
        // tslint:disable-next-line:no-unsafe-any
        return (hub[method as keyof Hub] as any)(...args);
    }
    throw new Error(`No hub defined or ${method} was not found on the hub, please open a bug report.`);
}

/**
 * Captures a manually created event and sends it to Sentry.
 *
 * @param event The event to send to Sentry.
 * @returns The generated eventId.
 */
export function captureBehavior(breadcrumb: Breadcrumb): string {
    return callOnBehaviorHub('captureBehavior', breadcrumb);
}

/**
 * Callback to set context information onto the scope.
 * @param callback Callback function that receives Scope.
 */
export function configureBehaviorScope(callback: (scope: Scope) => void): void {
    callOnBehaviorHub<void>('configureScope', callback);
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
export function withBehaviorScope(callback: (scope: Scope) => void): void {
    callOnBehaviorHub<void>('withScope', callback);
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
    callOnBehaviorHub<void>('_invokeClient', method, ...args);
}
