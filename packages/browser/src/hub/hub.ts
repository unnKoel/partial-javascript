import {
  Scope,
  Hub as HubInterface,
} from '../types';
import { Client } from '../client/client';
import { consoleSandbox, dynamicRequire, getGlobalObject, logger, uuid4 } from '@sentry/utils';

import { Carrier, Layer } from './interfaces';

const API_VERSION = 1;

/**
 * @inheritDoc
 */
export abstract class Hub implements HubInterface {
  /** Is a {@link Layer}[] containing the client and scope */
  private readonly _stack: Layer[] = [];

  /** Contains the last event id of a captured event.  */
  private _lastEventId?: string;

  /**
   * Creates a new instance of the hub, will push one {@link Layer} into the
   * internal stack on creation.
   *
   * @param client bound to the hub.
   * @param scope bound to the hub.
   * @param version number, higher number means higher priority.
   */
  public constructor(client?: Client<any>, scope?: Scope, private readonly _version: number = API_VERSION) {
    this._stack.push({ client, scope });
  }

  /**
   * 调用client的方法
   *
   * @param method The method to call on the client.
   * @param args Arguments to pass to the client function.
   */
  private _invokeClient<M extends keyof Client<any>>(method: M, ...args: any[]): void {
    const top = this.getStackTop();
    if (top && top.client && top.client[method]) {
      (top.client as any)[method](...args, top.scope);
    }
  }

  /**
   * @inheritDoc
   */
  public isOlderThan(version: number): boolean {
    return this._version < version;
  }

  /**
   * @inheritDoc
   */
  public bindClient(client?: Client<any>): void {
    const top = this.getStackTop();
    top.client = client;
  }

  /**
   * @inheritDoc
   */
  public pushScope(): Scope | undefined {
    // We want to clone the content of prev scope
    const stack = this.getStack();
    const parentScope = stack.length > 0 ? stack[stack.length - 1].scope : undefined;
    const scope = parentScope ? parentScope.clone() : undefined;
    this.getStack().push({
      client: this.getClient(),
      scope,
    });
    return scope;
  }

  /**
   * @inheritDoc
   */
  public popScope(): boolean {
    return this.getStack().pop() !== undefined;
  }

  /**
   * @inheritDoc
   */
  public withScope(callback: (scope: Scope | undefined) => void): void {
    const scope = this.pushScope();
    try {
      callback(scope);
    } finally {
      this.popScope();
    }
  }

  /**
   * @inheritDoc
   */
  public getClient<C extends Client<any>>(): C | undefined {
    return this.getStackTop().client as C;
  }

  /** Returns the scope of the top stack. */
  public getScope(): Scope | undefined {
    return this.getStackTop().scope;
  }

  /** Returns the scope stack for domains or the process. */
  public getStack(): Layer[] {
    return this._stack;
  }

  /** Returns the topmost scope layer in the order domain > local > process. */
  public getStackTop(): Layer {
    return this._stack[this._stack.length - 1];
  }

  /**
   * @inheritDoc
   */
  public lastEventId(): string | undefined {
    return this._lastEventId;
  }

  /**
   * @inheritDoc
   */
  public configureScope(callback: (scope: Scope) => void): void {
    const top = this.getStackTop();
    if (top.scope && top.client) {
      // TODO: freeze flag
      callback(top.scope);
    }
  }
}

/** Returns the global shim registry. */
export function getMainCarrier(): Carrier {
  const carrier = getGlobalObject();
  carrier.__SENTRY__ = carrier.__SENTRY__ || {
    hub: undefined,
  };
  return carrier;
}

/**
 * Replaces the current main hub with the passed one on the global object
 *
 * @returns The old replaced hub
 */
export function makeMain(hub: Hub): Hub {
  const registry = getMainCarrier();
  const oldHub = getHubFromCarrier(registry);
  setHubOnCarrier(registry, hub);
  return oldHub;
}

/**
 * Returns the default hub instance.
 *
 * If a hub is already registered in the global carrier but this module
 * contains a more recent version, it replaces the registered version.
 * Otherwise, the currently registered hub will be returned.
 */
export function getCurrentHub(): Hub {
  // Get main carrier (global for every environment)
  const registry = getMainCarrier();

  // If there's no hub, or its an old API, assign a new one
  if (!hasHubOnCarrier(registry) || getHubFromCarrier(registry).isOlderThan(API_VERSION)) {
    setHubOnCarrier(registry, new Hub());
  }

  // Prefer domains over global if they are there
  try {
    // We need to use `dynamicRequire` because `require` on it's own will be optimized by webpack.
    // We do not want this to happen, we need to try to `require` the domain node module and fail if we are in browser
    // for example so we do not have to shim it and use `getCurrentHub` universally.
    const domain = dynamicRequire(module, 'domain');
    const activeDomain = domain.active;

    // If there no active domain, just return global hub
    if (!activeDomain) {
      return getHubFromCarrier(registry);
    }

    // If there's no hub on current domain, or its an old API, assign a new one
    if (!hasHubOnCarrier(activeDomain) || getHubFromCarrier(activeDomain).isOlderThan(API_VERSION)) {
      const registryHubTopStack = getHubFromCarrier(registry).getStackTop();
      setHubOnCarrier(activeDomain, new Hub(registryHubTopStack.client, Scope.clone(registryHubTopStack.scope)));
    }

    // Return hub that lives on a domain
    return getHubFromCarrier(activeDomain);
  } catch (_Oo) {
    // Return hub that lives on a global object
    return getHubFromCarrier(registry);
  }
}

/**
 * This will tell whether a carrier has a hub on it or not
 * @param carrier object
 */
function hasHubOnCarrier(carrier: Carrier): boolean {
  if (carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub) {
    return true;
  }
  return false;
}

/**
 * This will create a new {@link Hub} and add to the passed object on
 * __SENTRY__.hub.
 * @param carrier object
 * @hidden
 */
export function getHubFromCarrier(carrier: Carrier): Hub {
  if (carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub) {
    return carrier.__SENTRY__.hub;
  }
  carrier.__SENTRY__ = carrier.__SENTRY__ || {};
  carrier.__SENTRY__.hub = new Hub();
  return carrier.__SENTRY__.hub;
}

/**
 * This will set passed {@link Hub} on the passed object's __SENTRY__.hub attribute
 * @param carrier object
 * @param hub Hub
 */
export function setHubOnCarrier(carrier: Carrier, hub: Hub): boolean {
  if (!carrier) {
    return false;
  }
  carrier.__SENTRY__ = carrier.__SENTRY__ || {};
  carrier.__SENTRY__.hub = hub;
  return true;
}
