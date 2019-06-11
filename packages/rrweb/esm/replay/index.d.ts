import Timer from "./timer";
import { eventWithTime, playerConfig, playerMetaData } from "../types";
import "./styles/style.css";
export declare class Replayer {
    wrapper: HTMLDivElement;
    iframe: HTMLIFrameElement;
    timer: Timer;
    private events;
    private config;
    private mouse;
    private emitter;
    private baselineTime;
    private lastPlayedEvent;
    private nextUserInteractionEvent;
    private noramlSpeed;
    private missingNodeRetryMap;
    constructor(events: eventWithTime[], config?: Partial<playerConfig>);
    on(event: string, handler: mitt.Handler): void;
    setConfig(config: Partial<playerConfig>): void;
    getMetaData(): playerMetaData;
    getTimeOffset(): number;
    /**
     * This API was designed to be used as play at any time offset.
     * Since we minimized the data collected from recorder, we do not
     * have the ability of undo an event.
     * So the implementation of play at any time offset will always iterate
     * all of the events, cast event before the offset synchronously
     * and cast event after the offset asynchronously with timer.
     * @param timeOffset number
     */
    play(timeOffset?: number): void;
    pause(): void;
    resume(timeOffset?: number): void;
    addEvent(event: eventWithTime): void;
    /**
     * 初始化dom
     */
    private setupDom;
    private handleResize;
    private getDelay;
    private getCastFn;
    private rebuildFullSnapshot;
    /**
     * pause when loading style sheet, resume when loaded all timeout exceed
     */
    private waitForStylesheetLoad;
    /**
     * 应用界面增量
     * @param e
     * @param isSync
     */
    private applyIncremental;
    private resolveMissingNode;
    private moveAndHover;
    private hoverElements;
    private isUserInteraction;
    private restoreSpeed;
    private warnNodeNotFound;
    private debugNodeNotFound;
}
//# sourceMappingURL=index.d.ts.map