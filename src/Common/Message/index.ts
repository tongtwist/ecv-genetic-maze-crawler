import { z } from "zod";
import { HealthMessage } from "./HealthMessage";
import { TJSON } from "./JSON.spec";
import { Result } from "./Result";
import { StopMessage } from "./StopMessage";

const baseMessageSchema = z.object({type: z.string().nonempty()});
const factories: {[k: string]:  any} = { }
factories[HealthMessage.type] = HealthMessage.fromJSON,
factories[StopMessage.type] = StopMessage.fromJSON

const factoryTypes : string[] = Object.keys(factories)

export function messageFromJSON(j: TJSON) {
    const retZod = baseMessageSchema.safeParse(j)
    if(!retZod.success){
        return Result.failureIn("messageFromJSON", retZod.error)
    }
    const data = retZod.data 
    return factoryTypes.includes(data.type) ? factories[data.type](j)
    : Result.failureIn("messageFromJSON", `No factory for ${data.type}`)
}

export * from "./HealthMessage"
export * from "./StopMessage"
export type {TStopMessageType, TStopMessage} from "./StopMessage.spec"
export type { THealthMessage, TShortCPUMessage, TLongCPUMessage, THealthMessageType} from "./HealthMessage.spec"

