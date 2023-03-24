import { TJSON, TJSONPrimitive, TJSONObject, TJSONArray } from '../JSON.spec'
import type {TStopMessageType, TStopMessage } from './StopMessage.spec'
import type {THealthMessageType, THealthMessage, TShortCPUMessage, TLongCPUMessage } from './HealthMessage.spec'

export type TMessageType = TStopMessageType | THealthMessageType
export interface IBaseMessage {
    readonly type: TMessageType
    toJSON(): TJSON
}
export type TMessage = TStopMessage| THealthMessage

export type {TStopMessageType, TStopMessage } from './StopMessage.spec'
export type {THealthMessageType, THealthMessage, TShortCPUMessage, TLongCPUMessage } from './HealthMessage.spec'