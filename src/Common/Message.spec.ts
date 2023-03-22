import {TJSON} from "../../JSON.spec";
import {TStopMessageTypes, TStopMessage} from "./Message/StopMessage.spec";
import {THealthMessageTypes} from "./Message/HealthMessage.spec";

export type TMessageType = TStopMessageTypes | THealthMessageTypes;
export interface IBaseMessage {
    readonly type: TMessageType;
    toJSON(): TJSON;
}

export type IMessage = TStopMessage ;

export type {
    TStopMessageTypes,
    TStopMessage,
} from "./Message/StopMessage.spec";