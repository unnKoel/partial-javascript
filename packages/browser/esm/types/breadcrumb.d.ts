import { Severity } from './severity';
import { EventBase } from './eventbase';
export interface Breadcrumb extends EventBase {
    type?: string;
    level?: Severity;
    category?: string;
    message?: string;
    data?: any;
}
export interface BreadcrumbHint {
    [key: string]: any;
}
//# sourceMappingURL=breadcrumb.d.ts.map