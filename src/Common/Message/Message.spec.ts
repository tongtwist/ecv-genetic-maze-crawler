import {TJSON} from "../../../JSON.spec";
import {TStopMessageTypes} from "./StopMessage.spec";

export type IMessageType = TStopMessageTypes;
export interface IBaseMessage {
    readonly type: IMessageType;
    toJSON(): TJSON;
}

