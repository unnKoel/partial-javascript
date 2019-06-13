import { Hub as HubBase } from './hub';
import { uuid4 } from '../utils/misc';
import { Severity, EventHint } from '../types';
import { ExceptionHub as ExceptionHubInterface } from '../types/hub';
import { getMainCarrier, hasHubOnCarrier, getHubFromCarrier, setHubOnCarrier, API_VERSION } from './hub';

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

const hubName = 'exceptionhub';

/**
 * Returns the default hub instance.
 *
 * If a hub is already registered in the global carrier but this module
 * contains a more recent version, it replaces the registered version.
 * Otherwise, the currently registered hub will be returned.
 */
export function getCurrentExceptionHub(): ExceptionHub {
  // Get main carrier (global for every environment)
  const registry = getMainCarrier<ExceptionHub>();

  // If there's no hub, or its an old API, assign a new one
  if (!hasHubOnCarrier<ExceptionHub>(registry, hubName) || getHubFromCarrier<ExceptionHub>(registry, hubName, ExceptionHub).isOlderThan(API_VERSION)) {
    setHubOnCarrier(registry, hubName, new ExceptionHub());
  }

  // Return hub that lives on a global object
  return getHubFromCarrier(registry, hubName);
}