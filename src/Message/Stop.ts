import { z } from "zod"
import { IResult, Result, TJSON, TJSONObject } from "../Common"
import type { IBaseMessage } from "../Message.spec"
import type { TStopMessageType, TStopMessage } from "./Stop.spec"


export class StopMessage implements IBaseMessage, TStopMessage {
	static readonly type: TStopMessageType = "stop"
	static readonly schema = z.object({
		type: z.literal(StopMessage.type)
	})

	constructor() {
		Object.freeze(this)
	}

	get type() { return StopMessage.type }

	static parse(j: TJSON): IResult<TStopMessage> {
		const retZod = StopMessage.schema.safeParse(j)
		return retZod.success
			? Result.success(j as TStopMessage)
			: Result.failureIn("StopMessage.parse", retZod.error)
	}

	toJSON(): TJSONObject {
		return { type: StopMessage.type }
	}

	static fromJSON(j: TJSON): IResult<IBaseMessage & TStopMessage> {
		const parsingRet = StopMessage.parse(j)
		if (parsingRet.isSuccess) {
			return Result.success(new StopMessage())
		}
		return Result.failureIn("StopMessage.fromJSON", parsingRet.error!)
	}
}
