import { Exception } from "./exception";
import { Severity } from "./severity";
import { Stacktrace } from "./stacktrace";
import { User } from "./user";

/** JSDoc */
export interface Event {
  event_id?: string;
  message?: string;
  timestamp?: number;
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
  tags?: { [key: string]: string };
  extra?: { [key: string]: any };
  user?: User;
}

/** JSDoc */
export interface EventHint {
  event_id?: string;
  syntheticException?: Error | null;
  originalException?: Error | null;
  data?: any;
}