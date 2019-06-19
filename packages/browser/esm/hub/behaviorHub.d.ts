import { Hub as HubBase } from './hub';
import { Breadcrumb, BreadcrumbHint } from '../types';
export declare class BehaviorHub extends HubBase {
    private _lastEventId?;
    lastEventId(): string | undefined;
    captureBehavior(behaviorEvent: Breadcrumb, hint?: BreadcrumbHint): string;
}
export declare function getCurrentBehaviorHub(): BehaviorHub;
//# sourceMappingURL=behaviorHub.d.ts.map