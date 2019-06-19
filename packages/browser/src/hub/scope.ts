import { Scope as ScopeInterface, User } from '../types';
import { isThenable, normalize, SyncPromise } from '../utils';
import { EventBase } from '../types/eventbase';

/**
 * Holds additional event information. {@link Scope.applyToEvent} will be
 * called by the client before an event will be sent.
 */
export class Scope implements ScopeInterface {
    /** Flag if notifiying is happening. */
    protected _notifyingListeners: boolean = false;

    /** Callback for client to receive scope changes. */
    protected _scopeListeners: Array<(scope: Scope) => void> = [];

    /** Callback list that will be called after {@link applyToEvent}. */
    protected _processors: Function[] = [];

    /** User */
    protected _user: User = {};

    /** Tags */
    protected _tags: { [key: string]: string } = {};

    /** Extra */
    protected _extra: { [key: string]: any } = {};

    /**
     * Add internal on change listener. Used for sub SDKs that need to store the scope.
     * @hidden
     */
    public addScopeListener(callback: (scope: Scope) => void): void {
        this._scopeListeners.push(callback);
    }

    public addProcessor(callback: Function): this {
        this._processors.push(callback);
        return this;
    }

    public clone(): Scope {
        const newScope = new Scope();
        Object.assign(newScope, this, {
            _scopeListeners: [],
        });
        newScope._tags = { ...this._tags };
        newScope._extra = { ...this._extra };
        newScope._user = this._user;
        newScope._processors = [...this._processors];
        return newScope;
    }

    /**
     * This will be called on every set call.
     */
    protected _notifyScopeListeners(): void {
        if (!this._notifyingListeners) {
            this._notifyingListeners = true;
            setTimeout(() => {
                this._scopeListeners.forEach(callback => {
                    callback(this);
                });
                this._notifyingListeners = false;
            });
        }
    }

    /**
     * This will be called after {@link applyToEvent} is finished.
     */
    protected _notifyProcessors<E, H>(
        processors: Function[],
        event: E,
        hint: H,
        index: number = 0,
    ): SyncPromise<E | null> {
        return new SyncPromise<E | null>((resolve, reject) => {
            const processor = processors[index];
            // tslint:disable-next-line:strict-type-predicates
            if (event === null || typeof processor !== 'function') {
                resolve(event);
            } else {
                const result = processor(event, hint);
                if (isThenable(result)) {
                    (result as Promise<E | null>)
                        .then(final => this._notifyProcessors(processors, final, hint, index + 1).then(resolve))
                        .catch(reject);
                } else {
                    this._notifyProcessors(processors, result, hint, index + 1)
                        .then(resolve)
                        .catch(reject);
                }
            }
        });
    }

    /**
     * @inheritDoc
     */
    public setUser(user: User | null): this {
        this._user = normalize(user);
        this._notifyScopeListeners();
        return this;
    }

    /**
     * @inheritDoc
     */
    public setTags(tags: { [key: string]: string }): this {
        this._tags = {
            ...this._tags,
            ...normalize(tags),
        };
        this._notifyScopeListeners();
        return this;
    }

    /**
     * @inheritDoc
     */
    public setTag(key: string, value: string): this {
        this._tags = { ...this._tags, [key]: normalize(value) };
        this._notifyScopeListeners();
        return this;
    }

    /**
     * @inheritDoc
     */
    public setExtras(extra: { [key: string]: any }): this {
        this._extra = {
            ...this._extra,
            ...normalize(extra),
        };
        this._notifyScopeListeners();
        return this;
    }

    /**
     * @inheritDoc
     */
    public setExtra(key: string, extra: any): this {
        this._extra = { ...this._extra, [key]: normalize(extra) };
        this._notifyScopeListeners();
        return this;
    }

    /**
     * @inheritDoc
     */
    public clear(): this {
        this._tags = {};
        this._extra = {};
        this._user = {};
        this._notifyScopeListeners();
        return this;
    }

    /**
     * Applies the current context and fingerprint to the event.
     * Note that breadcrumbs will be added by the client.
     * Also if the event has already breadcrumbs on it, we do not merge them.
     * @param event Event
     * @param hint May contain additional informartion about the original exception.
     * @param maxBreadcrumbs number of max breadcrumbs to merged into event.
     * @hidden
     */
    public applyToEvent<E extends EventBase, H>(event: E, hint?: H | undefined): SyncPromise<E | null> {
        if (this._extra && Object.keys(this._extra).length) {
            event.extra = { ...this._extra, ...event.extra };
        }

        if (this._tags && Object.keys(this._tags).length) {
            event.tags = { ...this._tags, ...event.tags };
        }

        if (this._user && Object.keys(this._user).length) {
            event.user = { ...this._user, ...event.user };
        }

        return this._notifyProcessors([...this._processors], event, hint);
    }
}