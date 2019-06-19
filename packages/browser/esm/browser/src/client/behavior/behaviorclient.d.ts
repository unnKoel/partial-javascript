import { BaseClient } from '../baseclient';
import { Breadcrumb, BreadcrumbHint, Options } from '../../types';
import { Scope } from '../../hub/scope';
export declare class BehaviorClient extends BaseClient<Options, Breadcrumb, BreadcrumbHint> {
    captureBehavior(event: Breadcrumb, hint?: BreadcrumbHint, scope?: Scope): string | undefined;
}
//# sourceMappingURL=behaviorclient.d.ts.map