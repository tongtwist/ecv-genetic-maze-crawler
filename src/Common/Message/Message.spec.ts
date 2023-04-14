import { TJSON } from "./../JSON.spec";
import { THealthMessage, THealthMessageType } from "./HealthMessage.spec";
import { TStopMessage, TStopMessageType } from "./StopMessage.spec";

export type TMessageType = THealthMessageType | TStopMessageType;

export interface IBaseMessage {
  readonly type: TMessageType;
  toJSON(): TJSON;
}

export type IMessage = THealthMessage | TStopMessage;
