import type {TJSON} from "../Common"
import type {
	THealthMessageType, THealthMessage,
	TStopMessageType, TStopMessage,
	TMazeMessageType, TMazeMessage,
	TWorldsStateMessageType, TWorldsStateMessage,
	TSimulateMessageType, TSimulateMessage,

} from "./Message"

export type TMessageType =
	| THealthMessageType
	| TStopMessageType
	| TMazeMessageType
	| TWorldsStateMessageType
	| TSimulateMessageType

export interface IBaseMessage {
	readonly type: TMessageType
	toJSON(): TJSON
}

export type TMessage =
	| THealthMessage
	| TStopMessage
	| TMazeMessage
	| TWorldsStateMessage
	| TSimulateMessage

export type {
	THealthMessageType, TShortCPUMessage, TLongCPUMessage, THealthMessage,
	TStopMessageType, TStopMessage,
	TMazeMessageType, TMazeMessage, IMazeMessage,
	TWorldsStateMessageType, TWorldsStateMessage,
	TSimulateMessageType, TSimulateMessage,
} from "./Message"