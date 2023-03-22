import { TStopMessageType } from "./StopMessage.spec";
import {z} from "zod";
import { Result } from "./Result";
import { TJSON } from "./JSON.spec";

export class StopMessage implements StopMessage{
    
    static readonly type : TStopMessageType = "stop"
    static readonly schema = z.object({
        type : z.literal(StopMessage.type)
    });

    constructor(){ }

    get type() {
        return StopMessage.type
    }

    static parse(j :TJSON) {
        const retZod = StopMessage.schema.safeParse(j)
        return retZod.success ? Result.success(j) : Result.failureIn("StopMessage.parse", retZod.error)
    }

    toJSON() {
        return {type: StopMessage.type}
    }

    static fromJSON(j : TJSON){
        const parsingRet = StopMessage.parse(j)
        if(parsingRet.isSuccess){
            return Result.success(new StopMessage())

        }
        return Result.failureIn("StopMessage.fromJson", parsingRet.error!)
    }


}