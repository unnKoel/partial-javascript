import {Hub as HubBase} from './hub';
import {uuid4} from '../utils/mics';
import {Severity, EventHint} from '../types';
import {ExceptionHub as ExceptionHubInterface} from '../types/hub';

export class ExceptionHub extends HubBase implements ExceptionHubInterface {
  /** Contains the last event id of a captured event.  */
  private _lastEventId?: string;

  /**
   * @inheritDoc
   */
  public lastEventId(): string | undefined {
    return this._lastEventId;
  }

  /**
   * @inheritDoc
   */
  public captureException(exception: any, hint?: EventHint): string {
    const eventId = (this._lastEventId = uuid4());
    this._invokeClient('captureException', exception, {
      ...hint,
      event_id: eventId,
    });
    return eventId;
  }

  /**
   * @inheritDoc
   */
  public captureMessage(
    message: string,
    level?: Severity,
    hint?: EventHint
  ): string {
    const eventId = (this._lastEventId = uuid4());
    this._invokeClient('captureMessage', message, level, {
      ...hint,
      event_id: eventId,
    });
    return eventId;
  }

  /**
   * @inheritDoc
   */
  public captureEvent(event: Event, hint?: EventHint): string {
    const eventId = (this._lastEventId = uuid4());
    this._invokeClient('captureEvent', event, {
      ...hint,
      event_id: eventId,
    });
    return eventId;
  }
}
