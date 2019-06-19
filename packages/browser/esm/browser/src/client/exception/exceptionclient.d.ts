import { Event, EventHint } from '../../types/event';
import { Scope } from '../../hub/scope';
import { ExceptionOptions } from '../../types';
import { Severity } from '../../types/severity';
import { Transport } from '../../transport/transport';
import { BaseClient } from '../baseclient';
import { Backend, BackendClass } from './basebackend';
export declare abstract class ExceptionClient<B extends Backend, O extends ExceptionOptions> extends BaseClient<O, Event, EventHint> {
    protected readonly _backend: B;
    protected constructor(backendClass: BackendClass<B, O>, transport: Transport, options: O);
    protected _getBackend(): B;
    captureException(exception: any, hint?: EventHint, scope?: Scope): string | undefined;
    captureMessage(message: string, level?: Severity, hint?: EventHint, scope?: Scope): string | undefined;
    captureEvent(event: Event, hint?: EventHint, scope?: Scope): string | undefined;
}
//# sourceMappingURL=exceptionclient.d.ts.map