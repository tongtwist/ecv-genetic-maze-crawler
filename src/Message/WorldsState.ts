import { z } from "zod"
import { IResult, Result, TJSON, TJSONObject, Generation } from "../Common"
import type { IBaseMessage } from "../Message.spec"
import type { TWorldsStateMessageType, TWorldsStateMessage } from "./WorldsState.spec"

export class WorldsStateMessage implements IBaseMessage, TWorldsStateMessage {
	static readonly type: TWorldsStateMessageType = "worldsState"
	static readonly schema = z.object({
		type: z.literal(WorldsStateMessage.type),
		states: z.array(z.object({
			population: z.number().int().nonnegative(),
			generation: z.number().int().nonnegative(),
			minAge: z.number().int().nonnegative(),
			maxAge: z.number().int().nonnegative(),
			avgAge: z.number().nonnegative(),
			minFitness: z.number().nonnegative(),
			maxFitness: z.number().nonnegative(),
			avgFitness: z.number().nonnegative(),
			solutions: z.array(z.object({
				guyID: z.number().int().nonnegative(),
				walk: z.object({
					steps: z.number().int().nonnegative(),
					wallHits: z.number().int().nonnegative(),
					backtracks: z.number().int().nonnegative(),
					closestDistance: z.number().nonnegative(),
					exploration: z.record(
						z.number().int().nonnegative(),
					),
				}),
				fitness: z.number().nonnegative(),
			})),
			explorations: z.record(
				z.number().int().nonnegative(),
			),
		})),
	})

	constructor(
		private readonly _states: Generation[],
	) {
		Object.freeze(this)
	}

	get type(): TWorldsStateMessageType { return WorldsStateMessage.type }
	get states() { return [...this._states] }

	static parse(j: TJSON): IResult<TWorldsStateMessage> {
		const retZod = WorldsStateMessage.schema.safeParse(j)
		return retZod.success
			? Result.success(j as TWorldsStateMessage)
			: Result.failureIn("WorldsStateMessage.parse", retZod.error)
	}

	toJSON(): TJSONObject {
		return {
			type: WorldsStateMessage.type,
			states: [...this._states],
		}
	}

	static fromJSON(j: TJSON): IResult<IBaseMessage & TWorldsStateMessage> {
		const parsingRet = WorldsStateMessage.parse(j)
		if (parsingRet.isSuccess) {
			const msg = new WorldsStateMessage(parsingRet.value!.states)
			return Result.success(msg)
		}
		return Result.failureIn("WorldsStateMessage.fromJSON", parsingRet.error!)
	}
}