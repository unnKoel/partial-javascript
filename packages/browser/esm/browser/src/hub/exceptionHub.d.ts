import { Hub as HubBase } from './hub';
import { Severity, EventHint } from '../types';
import { Event } from '../types';
import { ExceptionHub as ExceptionHubInterface } from '../types/hub';
export declare class ExceptionHub extends HubBase implements ExceptionHubInterface {
    private _lastEventId?;
    lastEventId(): string | undefined;
    captureException(exception: any, hint?: EventHint): string;
    captureMessage(message: string, level?: Severity, hint?: EventHint): string;
    captureEvent(event: Event, hint?: EventHint): string;
}
export declare function getCurrentExceptionHub(): ExceptionHub;
//# sourceMappingURL=exceptionHub.d.ts.map