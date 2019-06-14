import { BaseClient } from '../baseclient';
import { Breadcrumb, BreadcrumbHint, Options } from '../../types';
import { Scope } from '../../hub/scope';
import { logger } from '../../utils';

export class BehaviorClient extends BaseClient<Options, Breadcrumb, BreadcrumbHint> {
    public captureBehavior(event: Breadcrumb, hint?: BreadcrumbHint, scope?: Scope): string | undefined {
        let eventId: string | undefined = hint && hint.event_id;
        this._processing = true;
        this.processBeforeSend(event, hint, scope).then(finalEvent => {
            // We need to check for finalEvent in case beforeSend returned null
            eventId = finalEvent && finalEvent.event_id;
            this._processing = false;
        }).catch(reason => {
            logger.error(reason);
            this._processing = false;
        });

        return eventId;
    }
}