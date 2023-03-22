export type THealthMessageType = "health"

export type TShortCPUMessage ={
    readonly speed: number
    readonly user: number
    readonly nice : number
    readonly sys: number
    readonly idle : number
    readonly irq : number
}

export type TLongCPUMessage = TShortCPUMessage & {
    readonly model : string
}

export type THealthMessage = {
    readonly type: THealthMessageType
    readonly timestamp : number
    readonly loadAvg :number[]
    readonly cpus : TShortCPUMessage[] | TLongCPUMessage[]
    readonly freeMem :number
    readonly uptime : number
    readonly hostname? : string
    readonly machine? : string
    readonly platform? : string
    readonly release ?: string 
    readonly totalMem? : number 
    readonly version? : string 
    readonly architecture ?: string
}