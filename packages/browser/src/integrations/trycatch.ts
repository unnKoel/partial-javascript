import { Integration, WrappedFunction } from '../types';
import { fill, getGlobalObject } from '../utils';

import { wrap } from './helpers';

/** Wrap timer functions and event targets to catch errors and provide better meta data */
export class TryCatch implements Integration {
  /** JSDoc */
  private _ignoreOnError: number = 0;

  /**
   * @inheritDoc
   */
  public name: string = TryCatch.id;

  /**
   * @inheritDoc
   */
  public static id: string = 'TryCatch';

  /** JSDoc */
  private _wrapTimeFunction(original: () => void): () => number {
    return function (this: any, ...args: any[]): number {
      const originalCallback = args[0];
      args[0] = wrap(originalCallback);
      return original.apply(this, args);
    };
  }

  /** JSDoc */
  private _wrapRAF(original: any): (callback: () => void) => any {
    return function (this: any, callback: () => void): () => void {
      return original(
        wrap(callback),
      );
    };
  }

  /** JSDoc */
  private _wrapEventTarget(target: string): void {
    const global = getGlobalObject() as { [key: string]: any };
    const proto = global[target] && global[target].prototype;

    if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
      return;
    }

    fill(proto, 'addEventListener', function (
      original: () => void,
    ): (eventName: string, fn: EventListenerObject, options?: boolean | AddEventListenerOptions) => void {
      return function (
        this: any,
        eventName: string,
        fn: EventListenerObject,
        options?: boolean | AddEventListenerOptions,
      ): (eventName: string, fn: EventListenerObject, capture?: boolean, secure?: boolean) => void {
        try {
          fn.handleEvent = wrap(fn.handleEvent.bind(fn));
        } catch (err) {
          // can sometimes get 'Permission denied to access property "handle Event'
        }

        return original.call(
          this,
          eventName,
          wrap((fn as any) as WrappedFunction),
          options,
        );
      };
    });

    fill(proto, 'removeEventListener', function (
      original: () => void,
    ): (this: any, eventName: string, fn: EventListenerObject, options?: boolean | EventListenerOptions) => () => void {
      return function (
        this: any,
        eventName: string,
        fn: EventListenerObject,
        options?: boolean | EventListenerOptions,
      ): () => void {
        let callback = (fn as any) as WrappedFunction;
        try {
          callback = callback && (callback.__sentry_wrapped__ || callback);
        } catch (e) {
          // ignore, accessing __sentry_wrapped__ will throw in some Selenium environments
        }
        return original.call(this, eventName, callback, options);
      };
    });
  }

  /**
   * Wrap timer functions and event targets to catch errors
   * and provide better metadata.
   */
  public setupOnce(): void {
    this._ignoreOnError = this._ignoreOnError;

    const global = getGlobalObject();

    fill(global, 'setTimeout', this._wrapTimeFunction.bind(this));
    fill(global, 'setInterval', this._wrapTimeFunction.bind(this));
    fill(global, 'requestAnimationFrame', this._wrapRAF.bind(this));

    [
      'EventTarget',
      'Window',
      'Node',
      'ApplicationCache',
      'AudioTrackList',
      'ChannelMergerNode',
      'CryptoOperation',
      'EventSource',
      'FileReader',
      'HTMLUnknownElement',
      'IDBDatabase',
      'IDBRequest',
      'IDBTransaction',
      'KeyOperation',
      'MediaController',
      'MessagePort',
      'ModalWindow',
      'Notification',
      'SVGElementInstance',
      'Screen',
      'TextTrack',
      'TextTrackCue',
      'TextTrackList',
      'WebSocket',
      'WebSocketWorker',
      'Worker',
      'XMLHttpRequest',
      'XMLHttpRequestEventTarget',
      'XMLHttpRequestUpload',
    ].forEach(this._wrapEventTarget.bind(this));
  }
}
