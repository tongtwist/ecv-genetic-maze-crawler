import { TJSON, TJSONObject } from './../JSON.spec';
import { IBaseMessage } from './Message.spec'
import { z } from 'zod'
import type { IResult } from '../Result.spec'
import { Result } from '../Result'
import type { THealthMessage, THealthMessageType, TShortCPUMessage, TLongCPUMessage } from './HealthMessage.spec'


export class HealthMessage implements IBaseMessage, THealthMessage {
    static readonly type: THealthMessageType = 'health'
    private static _shortCPUSchema = z.object({
        speed: z.number().positive(),
        user: z.number().positive(),
        nice: z.number().positive(),
        sys: z.number().positive(),
        idle: z.number().positive(),
        irq: z.number().positive(),
    })
    private static _longCPUSchema = HealthMessage._shortCPUSchema.extend({
        model: z.string()
    })
    static readonly schema = z.object({
        type: z.literal(HealthMessage.type),
        timestamp: z.number().positive(),
        loadAvg: z.array(z.number().positive()),
        cpus: z.union([z.array(HealthMessage._shortCPUSchema),
                    z.array(HealthMessage._longCPUSchema),
        ]),
        freeMem: z.number().nonnegative(),
        uptime: z.number().positive(),
        hostname: z.string().optional(),
        machine: z.string().optional(),
        platform: z.string().optional(),
        release: z.string().optional(),
        totalMen: z.string().optional(),
        version: z.string().optional(),
        architecture: z.string().optional(),
    })
    constructor(
        private readonly _timestamp: number,
        private readonly _loadAvg: number[],
        private readonly _cpus: TShortCPUMessage[] | TLongCPUMessage[],
        private readonly _freeMem: number,
        private readonly _uptime: number,
        private readonly _hostname?:string,
        private readonly _machine?:string,
        private readonly _platform?:string,
        private readonly _release?:string,
        private readonly _totalMen?:string,
        private readonly _version?:string,
        private readonly _architecture?:string,
    ) {
        Object.freeze(this)
    }
    get type() { return HealthMessage.type }
    get timestamp() { return this._timestamp }
    get loadAvg() { return [...this._loadAvg] }
    get cpus() { return [...this._cpus] }
    get freeMem() { return this._freeMem }
    get uptime() { return this._uptime }
    get hostname() { return this._hostname }
    get machine() { return this._machine }
    get platform() { return this._platform }
    get release() { return this._release }
    get totalMen() { return this._totalMen }
    get version() { return this._version }
    get architecture() { return this._architecture }

    static parse(j: TJSON): IResult<THealthMessage> {
        const retZod = HealthMessage.schema.safeParse(j)
        return retZod.success
        ? Result.success(j as THealthMessage)
        : Result.failureIn('health message.parse',retZod.error)
    }

    toJSON(): TJSONObject {
        const ret: TJSONObject = {
            type: HealthMessage.type,
            timestamp: this._timestamp,
            loadAvg: this.loadAvg,
            cpus: this.cpus,
            freeMem: this._freeMem,
            uptime: this._uptime,
        }
        if (typeof this._hostname !== 'undefined') {
            ret.hostname = this._hostname
        }
        if (typeof this._machine !== 'undefined') {
            ret.machine = this._machine
        }
        if (typeof this._platform !== 'undefined') {
            ret.platform = this._platform
        }
        if (typeof this._release !== 'undefined') {
            ret.release = this._release
        }
        if (typeof this._totalMen !== 'undefined') {
            ret.totalMen = this._totalMen
        }
        if (typeof this._version !== 'undefined') {
            ret.version = this._version
        }
        if (typeof this._architecture !== 'undefined') {
            ret.architecture = this._architecture
        }
        return ret
    }
    static fromJSON(j:TJSON): IResult< IBaseMessage & THealthMessage> {
        const parsingRet = HealthMessage.parse(j)
        if (parsingRet.isSuccess) {
            const msg = new HealthMessage(
                parsingRet.value!.timestamp,
                parsingRet.value!.loadAvg,
                parsingRet.value!.cpus,
                parsingRet.value!.freeMem,
                parsingRet.value!.uptime,
                parsingRet.value!.hostname,
                parsingRet.value!.machine,
                parsingRet.value!.platform, 
                parsingRet.value!.release,  
                parsingRet.value!.totalMen, 
                parsingRet.value!.version,
                parsingRet.value!.architecture,
            )
            return Result.success(msg)
    }
    return Result.failureIn('health message.fromJSON', parsingRet.error!)
}
}
