import { z } from "zod";
import { IBaseMessage, IMessage } from "./Message.spec";
import { IResult } from "./../Result.spec";
import { TJSON } from "./../JSON.spec";
import { HealthMessage } from "./../Message/HealthMessage";
import { StopMessage } from "./../Message/StopMessage";
import { Result } from "./../Result";

const baseMessageSchema = z.object({ type: z.string().nonempty() });
const factories: {
  [k: string]: (j: TJSON) => IResult<IBaseMessage & IMessage>;
} = {};
factories[HealthMessage.type] = HealthMessage.fromJSON;
factories[StopMessage.type] = StopMessage.fromJSON;
Object.freeze(factories);

const factoryTypes: string[] = Object.keys(factories);

export function messageFromJSON(j: TJSON): IResult<IBaseMessage & IMessage> {
  const retZod = baseMessageSchema.safeParse(j);
  if (!retZod.success) {
    return Result.failureIn("messageFromJSON", retZod.error);
  }
  const { type } = retZod.data;
  if (!factoryTypes.includes(type)) {
    return Result.failureIn("messageFromJSON", `Unknown message type ${type}`);
  }
  return factories[type](j);
}

export * from "./HealthMessage";
export * from "./StopMessage";
export type {
  THealthMessage,
  THealthMessageType,
  TShortCPUMessage,
  TLongCPUMessage,
} from "./HealthMessage.spec";
export type { TStopMessageType, TStopMessage } from "./StopMessage.spec";
