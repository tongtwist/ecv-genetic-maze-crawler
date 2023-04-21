import type {Generation} from "../Common"

export type TWorldsStateMessageType = "worldsState"

export type TWorldsStateMessage = {
	readonly type: TWorldsStateMessageType
	readonly states: Generation[]
}
