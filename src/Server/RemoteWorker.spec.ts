import {IBaseMessage, THealthMessage, TJSON, TMessageType} from "../Common";

export interface IRemoterWorker {
    readonly lastHealth?: THealthMessage
    setHealth(v: THealthMessage & IBaseMessage): void;
    listen(): void;
    stop(): void;
    send(data: TJSON): Promise<boolean>;
    subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean;
}