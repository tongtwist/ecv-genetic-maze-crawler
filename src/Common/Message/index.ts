import { z } from "zod";
import { IBaseMessage, TMessage } from "../Message.spec";
import { Result } from "../Result";
import { IResult } from "../Result.spec";
import { HealthMessage } from "./HealthMessage";
import { StopMessage } from "./StopMessage";
import {TJSON} from "../../JSON.spec";

const baseMessageSchema = z.object({
    type: z.string().nonempty(),
});
const factories: { [k: string]: (j: TJSON) => IResult<TMessage & IBaseMessage>; } = {};
factories[HealthMessage.type] = HealthMessage.fromJSON;
factories[StopMessage.type] = StopMessage.fromJSON;
Object.freeze(factories);
const factoryTypes: string[] = Object.keys(factories);

export function messageFromJSON(j: TJSON): IResult<TMessage & IBaseMessage> {
    const retZode = baseMessageSchema.safeParse(j);
    if (!retZode.success) {
        return Result.failureIn("messageFromJSON", retZode.error);
    }
    const data = retZode.data;
    return factoryTypes.includes(data.type)
        ? factories[data.type](j)
        : Result.failureIn("messageFromJSON", `No factory for type ${data.type} message type`);
}

export * from "./HealthMessage";
export * from "./StopMessage";
export type {
    THealthMessage,
    THealthMessageTypes,
    TShortCPUMessage,
    TLongCPUMessage,
} from "./HealthMessage.spec";
export type { TStopMessage, TStopMessageTypes } from "./StopMessage.spec";