import {
  Scope,
  Hub as HubInterface,
} from '../types';
import { getGlobalObject } from '../utils';

import { Carrier, Layer } from './interfaces';

export const API_VERSION = 1;

/**
 * @inheritDoc
 */
export abstract class Hub implements HubInterface {
  /** Is a {@link Layer}[] containing the client and scope */
  private readonly _stack: Layer[] = [];

  /**
   * Creates a new instance of the hub, will push one {@link Layer} into the
   * internal stack on creation.
   *
   * @param client bound to the hub.
   * @param scope bound to the hub.
   * @param version number, higher number means higher priority.
   */
  public constructor(scope: Scope, client?: any, private readonly _version: number = API_VERSION) {
    this._stack.push({ client, scope });
  }

  /**
   * 调用client的方法
   *
   * @param method The method to call on the client.
   * @param args Arguments to pass to the client function.
   */
  protected _invokeClient(method: string, ...args: any[]): void {
    const top = this.getStackTop();
    if (top && top.client && (top.client as any)[method]) {
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
  public bindClient(client?: any): void {
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
  public getClient<C>(): C | undefined {
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
  public configureScope(callback: (scope: Scope) => void): void {
    const top = this.getStackTop();
    if (top.scope && top.client) {
      // TODO: freeze flag
      callback(top.scope);
    }
  }
}

/**
 * This will tell whether a carrier has a hub on it or not
 * @param carrier object
 */
export function hasHubOnCarrier<B extends Hub>(carrier: Carrier<B>, key: string): boolean {
  if (carrier && carrier.__SENTRY__ && carrier.__SENTRY__[key]) {
    return true;
  }
  return false;
}

export type HubClass<B extends Hub, S extends Scope> = new (scope: S) => B;

/**
 * This will create a new {@link Hub} and add to the passed object on
 * __SENTRY__.hub.
 * @param carrier object
 * @hidden
 */
export function getHubFromCarrier<B extends Hub, S extends Scope>(carrier: Carrier<B>, key: string, Hub?: HubClass<B, S>): B {
  if (carrier && carrier.__SENTRY__ && carrier.__SENTRY__[key]) {
    return carrier.__SENTRY__[key];
  }
  carrier.__SENTRY__ = carrier.__SENTRY__ || {};
  if (Hub) carrier.__SENTRY__.hub = new Hub();
  return carrier.__SENTRY__.hub;
}

/** Returns the global shim registry. */
export function getMainCarrier<B extends Hub>(): Carrier<B> {
  const carrier = getGlobalObject();
  carrier.__SENTRY__ = carrier.__SENTRY__ || {};
  return carrier;
}

/**
 * This will set passed {@link Hub} on the passed object's __SENTRY__.hub attribute
 * @param carrier object
 * @param hub Hub
 */
export function setHubOnCarrier<B extends Hub>(carrier: Carrier<B>, key: string, hub: B): boolean {
  if (!carrier) {
    return false;
  }
  carrier.__SENTRY__ = carrier.__SENTRY__ || {};
  carrier.__SENTRY__[key] = hub;
  return true;
}
