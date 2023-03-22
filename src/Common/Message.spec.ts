import { TJSON, TJSONObject } from "./JSON.spec";
import {
  THealthMessage,
  THealthMessageType,
} from "./Messages/HealthMessage.spec";
import { TStopMessageType, TStopMessage } from "./Messages/StopMessage.spec";

export type TMessageType = TStopMessageType | THealthMessageType;
export interface IBaseMessage {
  readonly type: TMessageType;
  toJSON(): TJSONObject | TJSON;
}
export type TMessage = TStopMessage | THealthMessage;
export type {
  TStopMessage,
  TStopMessageType,
} from "./Messages/StopMessage.spec";
