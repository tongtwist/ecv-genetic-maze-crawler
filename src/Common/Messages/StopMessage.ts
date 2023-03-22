import { TStopMessage, TStopMessageType } from "./StopMessage.spec";
import { z } from "zod";
import { TJSONObject, TJSON } from "../JSON.spec";
import { IResult } from "../Result.spec";
import { Result } from "../Result";
import { IBaseMessage } from "../Message.spec";

export class StopMessage implements TStopMessage {
  static readonly type: TStopMessageType = "stop";
  static readonly schema = z.object({
    type: z.literal(StopMessage.type),
  });

  constructor() {
    Object.freeze(this);
  }
  get type() {
    return StopMessage.type;
  }

  static parse(j: TJSON): IResult<TStopMessage> {
    const retZod = StopMessage.schema.safeParse(j);
    return retZod.success
      ? Result.success(j as TStopMessage)
      : Result.failureIn("StopMessage.parse", retZod.error);
  }

  toJson(): TJSONObject {
    return { type: StopMessage.type };
  }

  static fromJSON(j: TJSON): IResult<TStopMessage & IBaseMessage> {
    const parsingRet = StopMessage.parse(j);
    if (parsingRet.isSuccess) {
      return Result.success(parsingRet.value as TStopMessage & IBaseMessage);
    }
    return Result.failureIn("StopMessage.fromJSON", parsingRet.error!);
  }
}
