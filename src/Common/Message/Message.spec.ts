import { THealthMessage, THealthMessageType } from "./HealthMessage.spec";
import { TJSON } from "./JSON.spec";
import { TStopMessage, TStopMessageType } from "./StopMessage.spec";

export type TMessageType = TStopMessageType | THealthMessageType

export interface IBaseMessage {
    readonly type: TMessageType
    toJSON(): TJSON
}

export type TMessage= TStopMessage  | THealthMessage

