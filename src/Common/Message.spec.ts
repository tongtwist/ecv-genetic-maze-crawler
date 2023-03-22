import {TJSON} from "../../JSON.spec";
import {TStopMessageTypes, TStopMessage} from "./Message/StopMessage.spec";

export type IMessageType = TStopMessageTypes;
export interface IBaseMessage {
    readonly type: IMessageType;
    toJSON(): TJSON;
}

export type IMessage = TStopMessage ;

export type {
    TStopMessageTypes,
    TStopMessage,
} from "./Message/StopMessage.spec";