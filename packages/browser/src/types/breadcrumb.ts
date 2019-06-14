import { Severity } from './severity';
import { EventBase } from './eventbase';

/** JSDoc */
export interface Breadcrumb extends EventBase {
  type?: string;
  level?: Severity;
  category?: string;
  message?: string;
  data?: any;
}

/** JSDoc */
export interface BreadcrumbHint {
  [key: string]: any;
}
