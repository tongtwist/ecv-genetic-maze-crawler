import {TJSON} from "../JSON.spec";
import {TStopMessageTypes, TStopMessage, THealthMessage} from "./Message";
import {THealthMessageTypes} from "./Message";

export type TMessageType = TStopMessageTypes | THealthMessageTypes;
export interface IBaseMessage {
    readonly type: TMessageType;
    toJSON(): TJSON;
}

export type TMessage = TStopMessage | THealthMessage;

export type {
    TStopMessageTypes,
    TStopMessage,
} from "./Message/StopMessage.spec";