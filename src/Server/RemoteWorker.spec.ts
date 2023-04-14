import { IBaseMessage, THealthMessage, TJSON, TMessageType } from "../Common";

export interface IRemoteWorker{
    readonly lastHealth? : THealthMessage
    setHealth(v: IBaseMessage & THealthMessage): void
    listen(): void
    stop(): void
    send(data: TJSON): Promise<boolean>
    subscribe(type : TMessageType, handler: (data: TJSON) => void): boolean
}