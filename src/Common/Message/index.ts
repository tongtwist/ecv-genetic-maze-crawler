import { z } from "zod"
import type { TJSON } from "../JSON.spec"
import type { IResult} from "../Result.spec"
import { Result} from "../Result"
import type { IBaseMessage, TMessage } from "../Message.spec"

import { HealthMessage } from "./Health"
import { StopMessage } from "./Stop"
import { MazeMessage } from "./Maze"
import { WorldsStateMessage } from "./WorldsState"
import { SimulateMessage } from "./Simulate"

const baseMessageSchema = z.object({ type: z.string().nonempty() })
const factories: {[k: string]: (j: TJSON) => IResult<IBaseMessage & TMessage>} = {}
factories[HealthMessage.type] = HealthMessage.fromJSON
factories[StopMessage.type] = StopMessage.fromJSON
factories[MazeMessage.type] = MazeMessage.fromJSON
factories[WorldsStateMessage.type] = WorldsStateMessage.fromJSON
factories[SimulateMessage.type] = SimulateMessage.fromJSON
Object.freeze(factories)
const factoryTypes: string[] = Object.keys(factories)

export function messageFromJSON(j: TJSON): IResult<IBaseMessage & TMessage> {
	const retZod = baseMessageSchema.safeParse(j)
	if (!retZod.success) {
		return Result.failureIn("messageFromJSON", retZod.error)
	}
	const data = retZod.data
	return factoryTypes.includes(data.type)
		? factories[data.type](j)
		: Result.failureIn("messageFromJSON", `No factory for "${data.type}" message type`)
}

export * from "./Health"
export * from "./Stop"
export * from "./Maze"
export * from "./WorldsState"
export * from "./Simulate"
export type {THealthMessageType, TShortCPUMessage, TLongCPUMessage, THealthMessage} from "./Health.spec"
export type {TStopMessageType, TStopMessage} from "./Stop.spec"
export type {TMazeMessageType, TMazeMessage, IMazeMessage} from "./Maze.spec"
export type {TWorldsStateMessageType, TWorldsStateMessage} from "./WorldsState.spec"
export type {TSimulateMessageType, TSimulateMessage} from "./Simulate.spec"
