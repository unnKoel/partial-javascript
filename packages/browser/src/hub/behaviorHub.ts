import { Hub as HubBase } from './hub';
import { Breadcrumb, BreadcrumbHint } from '../types';
import { Scope } from './scope';
import { uuid4 } from '../utils/misc';
import { getMainCarrier, hasHubOnCarrier, getHubFromCarrier, setHubOnCarrier, API_VERSION } from './hub';

export class BehaviorHub extends HubBase {
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
    public captureBehavior(behaviorEvent: Breadcrumb, hint?: BreadcrumbHint): string {
        const eventId = (this._lastEventId = uuid4());
        this._invokeClient('captureScreenCap', behaviorEvent, {
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
export function getCurrentBehaviorHub(): BehaviorHub {
    // Get main carrier (global for every environment)
    const registry = getMainCarrier<BehaviorHub>();

    // If there's no hub, or its an old API, assign a new one
    if (!hasHubOnCarrier<BehaviorHub>(registry, hubName) || getHubFromCarrier<BehaviorHub, Scope>(registry, hubName, BehaviorHub).isOlderThan(API_VERSION)) {
        setHubOnCarrier(registry, hubName, new BehaviorHub());
    }

    // Return hub that lives on a global object
    return getHubFromCarrier(registry, hubName);
}