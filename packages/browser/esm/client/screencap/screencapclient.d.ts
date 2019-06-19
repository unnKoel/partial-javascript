import { BaseClient } from '../baseclient';
import { Scope } from '../../hub/scope';
import { ScreenCapEvent, ScreenCapEventHint, Options } from '../../types';
export declare class ScreenCapClient extends BaseClient<Options, ScreenCapEvent, ScreenCapEventHint> {
    captureScreenCap(event: ScreenCapEvent, hint?: ScreenCapEventHint, scope?: Scope): string | undefined;
}
//# sourceMappingURL=screencapclient.d.ts.map