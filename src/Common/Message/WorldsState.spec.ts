import type {Generation} from "../World.spec"


export type TWorldsStateMessageType = "worldsState"

export type TWorldsStateMessage = {
	readonly type: TWorldsStateMessageType
	readonly states: Generation[]
}
