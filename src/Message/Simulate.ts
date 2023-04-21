import { z } from "zod"
import { IResult, Result, TJSON, TJSONObject } from "../Common"
import type { IBaseMessage } from "../Message.spec"
import type { TSimulateMessageType, TSimulateMessage } from "./Simulate.spec"

export class SimulateMessage implements IBaseMessage, TSimulateMessage {
	static readonly type: TSimulateMessageType = "simulate"
	static readonly schema = z.object({
		type: z.literal(SimulateMessage.type),
		nbGeneration: z.number().int().nonnegative(),
		growthRate: z.number().int().nonnegative().max(1.5).min(0.75),
	})

	constructor(
		private readonly _nbGeneration: number,
		private readonly _growthRate: number,
	) {
		Object.freeze(this)
	}

	get type(): TSimulateMessageType { return SimulateMessage.type }
	get nbGeneration() { return this._nbGeneration }
	get growthRate() { return this._growthRate }

	static parse(j: TJSON): IResult<TSimulateMessage> {
		const retZod = SimulateMessage.schema.safeParse(j)
		return retZod.success
			? Result.success(j as TSimulateMessage)
			: Result.failureIn("SimulateMessage.parse", retZod.error)
	}

	toJSON(): TJSONObject {
		return {
			type: SimulateMessage.type,
			nbGeneration: this._nbGeneration,
			growthRate: this._growthRate,
		}
	}

	static fromJSON(j: TJSON): IResult<SimulateMessage> {
		const parsingRet = SimulateMessage.parse(j)
		if (parsingRet.isSuccess) {
			const msg = new SimulateMessage(
				parsingRet.value!.nbGeneration,
				parsingRet.value!.growthRate
			)
			return Result.success(msg)
		}
		return Result.failureIn("SimulateMessage.fromJSON", parsingRet.error!)
	}
}