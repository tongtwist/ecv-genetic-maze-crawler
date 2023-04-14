import type {TJSON} from "../Common"
import type {
	THealthMessageType, THealthMessage,
	TStopMessageType, TStopMessage,

} from "./Message"

export type TMessageType =
	| THealthMessageType
	| TStopMessageType

export interface IBaseMessage {
	readonly type: TMessageType
	toJSON(): TJSON
}

export type TMessage =
	| THealthMessage
	| TStopMessage

export type {
	THealthMessageType, TShortCPUMessage, TLongCPUMessage, THealthMessage,
	TStopMessageType, TStopMessage,
	
} from "./Message"