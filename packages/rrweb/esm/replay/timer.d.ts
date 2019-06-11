import { playerConfig, actionWithDelay } from '../types';
export default class Timer {
    timeOffset: number;
    private actions;
    private config;
    private raf;
    constructor(config: playerConfig, actions?: actionWithDelay[]);
    /**
     * Add an action after the timer starts.
     * @param action
     */
    addAction(action: actionWithDelay): void;
    /**
     * Add all actions before the timer starts
     * @param actions
     */
    addActions(actions: actionWithDelay[]): void;
    start(): void;
    clear(): void;
    private findActionIndex;
}
//# sourceMappingURL=timer.d.ts.map