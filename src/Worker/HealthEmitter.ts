import os from "node:os"
import { HealthMessage, THealthMessage, TJSON, TLongCPUMessage, TShortCPUMessage } from "../Common"
import type { IRemoteServer } from "./RemoteServer.spec"
import { IBaseMessage } from "../Common/Message.spec"


export class HealthEmitter {
	private readonly _hostname: string
	private readonly _machine: string
	private readonly _platform: string
	private readonly _release: string
	private readonly _totalMem: number
	private readonly _version: string
	private readonly _architecture: string

	constructor() {
		this._hostname = os.hostname()
		this._machine = os.machine()
		this._platform = os.platform()
		this._release = os.release()
		this._totalMem = os.totalmem()
		this._version = os.version()
		this._architecture = os.arch()
	}

	toMessage(expanded: boolean): TJSON {
		const timestamp = Date.now()
		const loadAvg = os.loadavg()
		const freeMem = os.freemem()
		const rawCpus = os.cpus()
		const uptime = os.uptime()
		if (expanded) {
			const cpus: TLongCPUMessage[] = rawCpus.map((c: os.CpuInfo) => ({
				...c.times,
				model: c.model,
				speed: c.speed,
			}))
			const msg: IBaseMessage & THealthMessage = new HealthMessage(timestamp,loadAvg,cpus,freeMem,uptime,
				this._hostname,
				this._machine,
				this._platform,
				this._release,
				this._totalMem,
				this._version,
				this._architecture,
			)
			return msg.toJSON()
		}
		const cpus: TShortCPUMessage[] = rawCpus.map((c: os.CpuInfo) => ({
			...c.times,
			speed: c.speed,
		}))
		const msg: IBaseMessage & THealthMessage = new HealthMessage(timestamp,loadAvg,cpus,freeMem,uptime)
		return msg.toJSON()
	}

	emit(remoteServer: IRemoteServer, expanded: boolean): Promise<boolean> {
		const data: TJSON = this.toMessage(expanded)
		return remoteServer.send(data)
	}
}
