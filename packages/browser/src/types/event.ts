import { Exception } from "./exception";
import { Severity } from "./severity";
import { Stacktrace } from "./stacktrace";
import { EventBase } from './eventbase';

/** JSDoc */
export interface Event extends EventBase {
  message?: string;
  level?: Severity;
  platform?: string;
  logger?: string;
  server_name?: string;
  release?: string;
  environment?: string;
  fingerprint?: string[];
  exception?: {
    values?: Exception[];
  };
  stacktrace?: Stacktrace;
  contexts?: { [key: string]: object };
}

/** JSDoc */
export interface EventHint {
  event_id?: string;
  syntheticException?: Error | null;
  originalException?: Error | null;
  data?: any;
}