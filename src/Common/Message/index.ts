import { THealthMessageType, TShortCPUMessage, TLongCPUMessage } from './HealthMessage.spec';
import { IResult } from './../Result.spec';
import { HealthMessage } from './HealthMessage';
import { StopMessage } from './StopMessage';
import { IBaseMessage, TMessage } from './Message.spec';
import { z } from 'zod';
import { Result } from '../Result';
import { TJSON } from '../JSON.spec';

const baseMessageSchema = z.object({type: z.string().nonempty()})
const factories: { [k: string]: (j: TJSON) => IResult<IBaseMessage & TMessage> } = {}
factories[HealthMessage.type] = HealthMessage.fromJSON
factories[StopMessage.type] = StopMessage.fromJSON

Object.freeze(factories)
const factoryTypes:string[] = Object.keys(factories)

export function messageFromJSON(j:TJSON): IResult<IBaseMessage & TMessage> {
    const retZod = baseMessageSchema.safeParse(j)
    if (!retZod.success) {
        return Result.failureIn('message.fromJSON', retZod.error)
    }
    const data = retZod.data
    return factoryTypes.includes(data.type)
    ? factories[data.type](j)
    : Result.failureIn('message.fromJSON', `no factory for "${data.type}" message type`)
} 

export * from "./HealthMessage"
export * from "./StopMessage"
export type { THealthMessageType,TShortCPUMessage,TLongCPUMessage,THealthMessage } from "./HealthMessage.spec"
export type { TStopMessageType,TStopMessage } from "./StopMessage.spec"