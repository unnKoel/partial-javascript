import { Hub as HubBase } from './hub';
import { ScreenCapEvent, ScreenCapEventHint } from '../types';
export declare class ScreenCapHub extends HubBase {
    private _lastEventId?;
    lastEventId(): string | undefined;
    captureScreenCap(screenCapEvent: ScreenCapEvent, hint?: ScreenCapEventHint): string;
}
export declare function getCurrentScreenCapHub(): ScreenCapHub;
//# sourceMappingURL=screencapHub.d.ts.map