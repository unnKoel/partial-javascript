import { User } from './user';
import { EventProcessor } from './eventprocessor';

/**
 * 基础Scope接口
 */
export interface Scope {
  /** 添加日志处理到处理管道 */
  addProcessor(callback: any): this;

  /**
   * 更新日志的用户信息
   *
   * @param user User context object to be set in the current context. Pass `null` to unset the user.
   */
  setUser(user: User | null): this;

  /**
   * Set an object that will be merged sent as tags data with the event.
   * @param tags Tags context object to merge into current context.
   */
  setTags(tags: { [key: string]: string }): this;

  /**
   * Set key:value that will be sent as tags data with the event.
   * @param key String key of tag
   * @param value String value of tag
   */
  setTag(key: string, value: string): this;

  /**
   * Set an object that will be merged sent as extra data with the event.
   * @param extras Extras object to merge into current context.
   */
  setExtras(extras: { [key: string]: any }): this;

  /**
   * Set key:value that will be sent as extra data with the event.
   * @param key String of extra
   * @param extra Any kind of data. This data will be normailzed.
   */
  setExtra(key: string, extra: any): this;

  /** Clears the current scope and resets its properties. */
  clear(): this;

  clone(): Scope;
}

/**
 * 异常Scope接口
 */
export interface ExceptionScope extends Scope {
  /** Add new event processor that will be called after {@link applyToEvent}. */
  addEventProcessor(callback: EventProcessor): this;

  /**
   * Sets context data with the given name.
   * @param name of the context
   * @param context Any kind of data. This data will be normailzed.
   */
  setContext(name: string, context: { [key: string]: any } | null): this;
}