import {TStopMessage, TStopMessageTypes} from "./StopMessage.spec";
import {TJSON, TJSONObject} from "../../../JSON.spec";
import { z } from "zod";
import {IResult} from "../Result.spec";
import {Result} from "../Result";
import {IBaseMessage} from "../Message.spec";
export class StopMessage implements  TStopMessage, IBaseMessage{
    static readonly type: TStopMessageTypes = 'stop';
    static readonly schema = z.object({
        type: z.literal(StopMessage.type),
    });

    constructor() {
        Object.freeze(this);
    }

    get type(){
        return StopMessage.type;
    }

    static parse(j: TJSON): IResult<TStopMessage> {
        const retZod = StopMessage.schema.safeParse(j);
        return retZod.success
            ? Result.success(j as TStopMessage)
            : Result.failureIn("StopMessage.parse", retZod.error);
    }

    toJSON():TJSONObject{
        return {
            type: StopMessage.type,
        };
    }

    static fromJSON(j: TJSON): IResult<TStopMessage & IBaseMessage> {
        const parsingRet = StopMessage.parse(j);
        if (parsingRet.IsSuccess) {
            return Result.success(new StopMessage());
        }
        return Result.failureIn("StopMessage.fromJSON", parsingRet.error!);
    }
}