import type { TJSON } from "../Common";
import type {
  THealthMessageType,
  THealthMessage,
  TStopMessageType,
  TStopMessage,
} from "./Message";
	THealthMessageType, THealthMessage,
	TStopMessageType, TStopMessage,
	TMazeMessageType, TMazeMessage,
	TWorldsStateMessageType, TWorldsStateMessage,
	TSimulateMessageType, TSimulateMessage,

export type TMessageType = THealthMessageType | TStopMessageType;

export interface IBaseMessage {
  readonly type: TMessageType;
  toJSON(): TJSON;
  readonly hostname?: string;
}

export type TMessage = THealthMessage | TStopMessage;

export type {
  THealthMessageType,
  TShortCPUMessage,
  TLongCPUMessage,
  THealthMessage,
  TStopMessageType,
  TStopMessage,
} from "./Message";
