export type THealthMessageTypes = 'health';

export type TShortCPUMessage = {
    readonly speed: number;
    readonly user: number;
    readonly nice: number;
    readonly sys: number;
    readonly idle: number;
    readonly irq: number;

}

export type TLongCPUMessage = TShortCPUMessage & {
    readonly model: string;
}

export type THealthMessage = {
    readonly type: THealthMessageTypes;
    readonly timestamp: number;
    readonly loadavg: number[];
    readonly cpu: TShortCPUMessage[] | TLongCPUMessage[];
    readonly freemem: number;
    readonly totalmem?: number;
    readonly uptime: number;
    readonly hostname?: string;
    readonly platform?: string;
    readonly version?: string;
    readonly architecture?: string;
    readonly release?: string;
    readonly machine?: string;
}