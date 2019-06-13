import { BaseClient } from '../baseclient';
import { eventWithTime as ScreenCapEvent } from '@partial/rrweb/src/types';
import { ScreenCapEventHint, Options } from '../../types';

export class ScreenCapClient extends BaseClient<Options, ScreenCapEvent, ScreenCapEventHint> {

}