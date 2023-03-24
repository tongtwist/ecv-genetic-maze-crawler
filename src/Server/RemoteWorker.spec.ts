import { IBaseMessage } from './../Common/Message/Message.spec';
import { THealthMessage } from './../Common/Message/HealthMessage.spec';
import type {TMessageType, TJSON} from "../Common"

export interface IRemoteWorker {
    readonly lastHealth?: THealthMessage
    setHealth(v: IBaseMessage & THealthMessage): void
    listen(): void
    stop():void
    send(data: TJSON): Promise<boolean>
    subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean
}