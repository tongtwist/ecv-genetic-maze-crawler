import { z } from "zod"
import type { TJSON } from "../JSON.spec"
import type { IResult} from "../Result.spec"
import { Result} from "../Result"
import type { IBaseMessage, TMessage } from "../Message.spec"

import { HealthMessage } from "./HealthMessage"
import { StopMessage } from "./StopMessage"

const baseMessageSchema = z.object({ type: z.string().nonempty() })
const factories: {[k: string]: (j: TJSON) => IResult<IBaseMessage & TMessage>} = {}
factories[HealthMessage.type] = HealthMessage.fromJSON
factories[StopMessage.type] = StopMessage.fromJSON
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

export * from "./HealthMessage"
export * from "./StopMessage"
export type {THealthMessageType, TShortCPUMessage, TLongCPUMessage, THealthMessage} from "./HealthMessage.spec"
export type {TStopMessageType, TStopMessage} from "./StopMessage.spec"
