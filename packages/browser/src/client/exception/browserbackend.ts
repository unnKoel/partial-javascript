import { Backend } from './basebackend';
import { Event, EventHint, ExceptionOptions, Severity } from '../../types';
import {
  addExceptionTypeValue,
  isDOMError,
  isDOMException,
  isError,
  isErrorEvent,
  isPlainObject,
  SyncPromise,
} from '../../utils';

import { eventFromPlainObject, eventFromStacktrace, prepareFramesForEvent } from './parsers';
import { _computeStackTrace } from './tracekit';

/**
 * Configuration options for the Sentry Browser SDK.
 * @see BrowserClient for more information.
 */
export interface BrowserOptions extends ExceptionOptions {
  /**
   * A pattern for error URLs which should not be sent to Sentry.
   * To whitelist certain errors instead, use {@link Options.whitelistUrls}.
   * By default, all errors will be sent.
   */
  blacklistUrls?: Array<string | RegExp>;

  /**
   * A pattern for error URLs which should exclusively be sent to Sentry.
   * This is the opposite of {@link Options.blacklistUrls}.
   * By default, all errors will be sent.
   */
  whitelistUrls?: Array<string | RegExp>;
}

/**
 * The Sentry Browser SDK Backend.
 * @hidden
 */
export class BrowserBackend implements Backend {
  /**
   * @inheritDoc
   */
  public eventFromException(exception: any, hint?: EventHint): SyncPromise<Event> {
    let event: Event;

    if (isErrorEvent(exception as ErrorEvent) && (exception as ErrorEvent).error) {
      // If it is an ErrorEvent with `error` property, extract it to get actual Error
      const errorEvent = exception as ErrorEvent;
      exception = errorEvent.error; // tslint:disable-line:no-parameter-reassignment
      event = eventFromStacktrace(_computeStackTrace(exception as Error));
      return SyncPromise.resolve(this._buildEvent(event, hint));
    }
    if (isDOMError(exception as DOMError) || isDOMException(exception as DOMException)) {
      // If it is a DOMError or DOMException (which are legacy APIs, but still supported in some browsers)
      // then we just extract the name and message, as they don't provide anything else
      // https://developer.mozilla.org/en-US/docs/Web/API/DOMError
      // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
      const domException = exception as DOMException;
      const name = domException.name || (isDOMError(domException) ? 'DOMError' : 'DOMException');
      const message = domException.message ? `${name}: ${domException.message}` : name;

      return this.eventFromMessage(message, Severity.Error, hint).then(messageEvent => {
        addExceptionTypeValue(messageEvent, message);
        return SyncPromise.resolve(this._buildEvent(messageEvent, hint));
      });
    }
    if (isError(exception as Error)) {
      // we have a real Error object, do nothing
      event = eventFromStacktrace(_computeStackTrace(exception as Error));
      return SyncPromise.resolve(this._buildEvent(event, hint));
    }
    if (isPlainObject(exception as {}) && hint && hint.syntheticException) {
      // If it is plain Object, serialize it manually and extract options
      // This will allow us to group events based on top-level keys
      // which is much better than creating new group when any key/value change
      const objectException = exception as {};
      event = eventFromPlainObject(objectException, hint.syntheticException);
      addExceptionTypeValue(event, 'Custom Object', undefined);
      event.level = Severity.Error;
      return SyncPromise.resolve(this._buildEvent(event, hint));
    }

    // If none of previous checks were valid, then it means that
    // it's not a DOMError/DOMException
    // it's not a plain Object
    // it's not a valid ErrorEvent (one with an error property)
    // it's not an Error
    // So bail out and capture it as a simple message:
    const stringException = exception as string;
    return this.eventFromMessage(stringException, undefined, hint).then(messageEvent => {
      addExceptionTypeValue(messageEvent, `${stringException}`, undefined);
      messageEvent.level = Severity.Error;
      return SyncPromise.resolve(this._buildEvent(messageEvent, hint));
    });
  }

  /**
   * This is an internal helper function that creates an event.
   */
  private _buildEvent(event: Event, hint?: EventHint): Event {
    return {
      ...event,
      event_id: hint && hint.event_id,
    };
  }

  /**
   * @inheritDoc
   */
  public eventFromMessage(message: string, level: Severity = Severity.Info, hint?: EventHint): SyncPromise<Event> {
    const event: Event = {
      event_id: hint && hint.event_id,
      level,
      message,
      timestamp: Date.now()
    };

    if (hint && hint.syntheticException) {
      const stacktrace = _computeStackTrace(hint.syntheticException);
      const frames = prepareFramesForEvent(stacktrace.stack);
      event.stacktrace = {
        frames,
      };
    }

    return SyncPromise.resolve(event);
  }
}
