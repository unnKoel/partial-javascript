import { Hub as HubBase } from './hub';
import { Scope } from './scope';
import { ScreenCapEvent, ScreenCapEventHint } from '../types';
import { uuid4 } from '../utils/misc';
import { getMainCarrier, hasHubOnCarrier, getHubFromCarrier, setHubOnCarrier, API_VERSION } from './hub';

export class ScreenCapHub extends HubBase {
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
    public captureScreenCap(screenCapEvent: ScreenCapEvent, hint?: ScreenCapEventHint): string {
        const eventId = (this._lastEventId = uuid4());
        this._invokeClient('captureScreenCap', screenCapEvent, {
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
export function getCurrentScreenCapHub(): ScreenCapHub {
    // Get main carrier (global for every environment)
    const registry = getMainCarrier<ScreenCapHub>();

    // If there's no hub, or its an old API, assign a new one
    if (!hasHubOnCarrier<ScreenCapHub>(registry, hubName) || getHubFromCarrier<ScreenCapHub, Scope>(registry, hubName, ScreenCapHub).isOlderThan(API_VERSION)) {
        setHubOnCarrier(registry, hubName, new ScreenCapHub());
    }

    // Return hub that lives on a global object
    return getHubFromCarrier(registry, hubName);
}