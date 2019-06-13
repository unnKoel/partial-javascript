import { Event, EventHint } from '../../types/event';
import { ExceptionOptions, Scope } from '../../types';
import { Severity } from '../../types/severity';
import { Transport } from '../../transport/transport';
import { BaseClient } from '../baseclient';
import { logger, isPrimitive } from '../../utils';
import { Backend, BackendClass } from './basebackend';

/**
 * User-Facing Sentry SDK Client.
 *
 * This interface contains all methods to interface with the SDK once it has
 * been installed. It allows to send events to Sentry, record breadcrumbs and
 * set a context included in every event. Since the SDK mutates its environment,
 * there will only be one instance during runtime.
 *
 */
export abstract class ExceptionClient<B extends Backend, O extends ExceptionOptions> extends BaseClient<O, Event, EventHint> {
  protected readonly _backend: B;

  protected constructor(backendClass: BackendClass<B, O>, transport: Transport, options: O) {
    super(transport, options);
    this._backend = new backendClass(options);
  }

  /** Returns the current backend. */
  protected _getBackend(): B {
    return this._backend;
  }

  /**
 * @inheritDoc
 */
  public captureException(exception: any, hint?: EventHint, scope?: Scope): string | undefined {
    let eventId: string | undefined = hint && hint.event_id;
    this._processing = true;

    this._getBackend()
      .eventFromException(exception, hint)
      .then(event => super.processBeforeSend(event, hint, scope))
      .then(finalEvent => {
        // We need to check for finalEvent in case beforeSend returned null
        eventId = finalEvent && finalEvent.event_id;
        this._processing = false;
      })
      .catch(reason => {
        logger.error(reason);
        this._processing = false;
      });

    return eventId;
  }

  /**
   * @inheritDoc
   */
  public captureMessage(message: string, level?: Severity, hint?: EventHint, scope?: Scope): string | undefined {
    let eventId: string | undefined = hint && hint.event_id;

    this._processing = true;

    const promisedEvent = isPrimitive(message)
      ? this._getBackend().eventFromMessage(`${message}`, level, hint)
      : this._getBackend().eventFromException(message, hint);

    promisedEvent
      .then(event => super.processBeforeSend(event, hint, scope))
      .then(finalEvent => {
        // We need to check for finalEvent in case beforeSend returned null
        eventId = finalEvent && finalEvent.event_id;
        this._processing = false;
      })
      .catch(reason => {
        logger.error(reason);
        this._processing = false;
      });

    return eventId;
  }

  /**
   * @inheritDoc
   */
  public captureEvent(event: Event, hint?: EventHint, scope?: Scope): string | undefined {
    let eventId: string | undefined = hint && hint.event_id;
    this._processing = true;

    super.processBeforeSend(event, hint, scope)
      .then(finalEvent => {
        // We need to check for finalEvent in case beforeSend returned null
        eventId = finalEvent && finalEvent.event_id;
        this._processing = false;
      })
      .catch(reason => {
        logger.error(reason);
        this._processing = false;
      });
    return eventId;
  }
}
