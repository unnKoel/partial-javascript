import { User } from "./user";
export interface EventBase {
    event_id?: string;
    tags?: {
        [key: string]: string;
    };
    extra?: {
        [key: string]: any;
    };
    user?: User;
    timestamp: number;
}
//# sourceMappingURL=eventbase.d.ts.map