import { Integration } from '../types';
import { record } from '@partial/rrweb';
import { getCurrentScreenCapHub } from '../hub/screencapHub';

export class ScreenCaps implements Integration {
    public name: string = ScreenCaps.id;

    /**
     * @inheritDoc
     */
    public static id: string = 'ScreenCaps';

    setupOnce(): void {
        record({
            emit(event) {
                getCurrentScreenCapHub().captureScreenCap(event);
            },
        });
    }
}