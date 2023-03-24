import { TJSON, TJSONObject } from './../JSON.spec';
import { TMessageType, IBaseMessage } from './Message.spec'
import { z } from 'zod'
import { IResult } from '../Result.spec'
import { Result } from '../Result'

export type TStopMessageType = 'stop'
export type TStopMessage = {
    readonly type: TStopMessageType
}

export class StopMessage implements IBaseMessage, TStopMessage {
    static readonly type: TStopMessageType = 'stop'
    static readonly shcema = z.object({
        type: z.literal(StopMessage.type)
    })
    constructopr() {
        Object.freeze(this)
    }
    get type() { return StopMessage.type }

    static parse(j: TJSON): IResult<TStopMessage> {
        const retZod = StopMessage.shcema.safeParse(j)
        return retZod.success
        ? Result.success(j as TStopMessage)
        : Result.failureIn('stop message.parse',retZod.error)
    }

    toJSON(): TJSONObject {
        return { type: StopMessage.type}
    }
    static fromJSON(j: TJSON): IResult<IBaseMessage & TStopMessage> {
        const parsingRet = StopMessage.parse(j)
        if (parsingRet.isSuccess) {
            return Result.success(new StopMessage())
        }
        return Result.failureIn('stop message.fromJSON', parsingRet.error!)
    }
}