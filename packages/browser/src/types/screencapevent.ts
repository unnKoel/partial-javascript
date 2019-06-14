/** JSDoc */
import { eventWithTime } from '@partial/rrweb/src/types';
import { EventBase } from './eventbase';

export type ScreenCapEvent = eventWithTime & EventBase;

export interface ScreenCapEventHint {
    [key: string]: any;
}
