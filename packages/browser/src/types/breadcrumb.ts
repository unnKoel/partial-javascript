import { Severity } from './severity';

/** JSDoc */
export interface Breadcrumb {
  type?: string;
  level?: Severity;
  category?: string;
  message?: string;
  data?: any;
  timestamp?: number;
}

/** JSDoc */
export interface BreadcrumbHint {
  [key: string]: any;
}
