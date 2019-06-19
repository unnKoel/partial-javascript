import { Event, EventHint } from './event';
export declare type EventProcessor = (event: Event, hint?: EventHint) => Promise<Event | null> | Event | null;
//# sourceMappingURL=eventprocessor.d.ts.map