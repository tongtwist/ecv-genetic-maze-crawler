import { z } from "zod";
import { THealthMessage, THealthMessageType, TLongCPUMessage, TShortCPUMessage } from "./HealthMessage.spec";
import { TJSON, TJSONObject } from "./JSON.spec";
import { Result } from "./Result";
import { IResult } from "./Result.spec";
import { StopMessage } from "./StopMessage";

export class HealthMessage implements THealthMessage {
    static readonly type : THealthMessageType = "health"
    private static _shortCPUSchema = z.object({
        speed: z.number().positive(),
        user: z.number().nonnegative(),
        nice: z.number().nonnegative(),
        sys: z.number().nonnegative(),
        idle:  z.number().nonnegative(),
        irq: z.number().nonnegative(),
    })

    private static _longCPUSchema = HealthMessage._shortCPUSchema.extend({
        model: z.string()
    })

    static readonly schema = z.object({
        type : z.literal(HealthMessage.type),
        timestamp : z.number(),
        loadAvg: z.array(z.number().nonnegative()),
        cpus: z.union([
            z.array(HealthMessage._shortCPUSchema),
            z.array(HealthMessage._longCPUSchema)
        ]),
        freeMem: z.number().nonnegative(),
        uptime : z.number().nonnegative(),
        hostname: z.string().optional(),
        machine:z.string().optional(),
        platform:z.string().optional(),
        release:z.string().optional(),
        totalMem: z.number().int().positive().optional(),
        version:z.string().optional(),
        architecture:z.string().optional(),
    })

    constructor(
        private readonly _timestamp: number,
        private readonly _loadAvg :number[],
        private  readonly _cpus : TShortCPUMessage[] | TLongCPUMessage[],
        private  readonly _freeMem :number,
        private  readonly _uptime : number,
        private  readonly _hostname? : string,
        private  readonly _machine? : string,
        private  readonly _platform? : string,
        private  readonly _release ?: string ,
        private  readonly _totalMem? : number ,
        private  readonly _version? : string ,
        private  readonly _architecture ?: string,
   ){
        Object.freeze(this)
    }

    get type(){
        return HealthMessage.type
    }

    get timestamp(){
        return this._timestamp
    }

    get loadAvg(): number[]{
        return [...this.loadAvg]
    }

    get cpus(){
        return [...this._cpus]
    }

    get freeMem(){
        return this._freeMem
    }

    get uptime(){
        return this._uptime
    }

    get hostname(){
        return this._hostname
    }

    get machine(){
        return this._machine
    }

    get platform(){
        return this._platform
    }

    get release(){
        return this._release
    }

    get totalMem(){
        return this._totalMem
    }

    get version(){
        return this._version
    }

    get architecture(){
        return this._architecture
    }

    static parse(j: TJSON) {
        const retZod = StopMessage.schema.safeParse(j)
        return retZod.success ? Result.success(j) : Result.failureIn("StopMessage.parse", retZod.error)
    
    }

    toJSON(): TJSONObject{
        const ret: TJSONObject= {
            type: HealthMessage.type,
            timestamp: this._timestamp,
            loadAvg: this._loadAvg,
            cpus: this._cpus,
            freeMem: this._freeMem,
            uptime: this._uptime

        }
        if(typeof this._hostname !== "undefined"){
            ret.hostname = this._hostname
        }
        if(typeof this._machine !== "undefined"){
            ret.machine = this._machine
        }

        if(typeof this._platform !== "undefined"){
            ret.platform = this._platform
        }
        if(typeof this._release !== "undefined"){
            ret.release = this._release
        }

        if(typeof this._totalMem !== "undefined"){
            ret.totalMem = this._totalMem
        }
        if(typeof this._version !== "undefined"){
            ret.version = this._version
        }
        if(typeof this._architecture !== "undefined"){
            ret.architecture = this._architecture
        }
        
        return ret
    }

    static fromJSON(j: TJSON){
        const parsingRet = HealthMessage.parse(j) as unknown as IResult<THealthMessage>
        if(parsingRet.isSuccess){
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
                parsingRet.value!.totalMem,
                parsingRet.value!.version,
                parsingRet.value!.architecture,
               
            )
            return Result.success(msg)
        }
        return Result.failure("Failure")

    }

}