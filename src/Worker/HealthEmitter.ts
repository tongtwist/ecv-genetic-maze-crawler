import os from "node:os"
import { HealthMessage, THealthMessage, TLongCPUMessage, TShortCPUMessage } from "../Message"
import { ILogger,  TJSON } from "../Common"
import type { IRemoteServer } from "./RemoteServer.spec"
import { IBaseMessage } from "../Message.spec"


export class HealthEmitter {
	private readonly _hostname: string
	private readonly _machine: string
	private readonly _platform: string
	private readonly _release: string
	private readonly _totalMem: number
	private readonly _version: string
	private readonly _architecture: string
	private _emitExpandedHealth: boolean
	private _timer?: NodeJS.Timer
	private _stopTimer?: () => void

	constructor(
		private readonly _remoteServer: IRemoteServer,
		private readonly _logger?: ILogger
	) {
		this._hostname = os.hostname()
		this._machine = os.machine()
		this._platform = os.platform()
		this._release = os.release()
		this._totalMem = os.totalmem()
		this._version = os.version()
		this._architecture = os.arch()
		this._emitExpandedHealth = true
	}

	toMessage(): TJSON {
		const timestamp = Date.now()
		const loadAvg = os.loadavg()
		const freeMem = os.freemem()
		const rawCpus = os.cpus()
		const uptime = os.uptime()
		if (this._emitExpandedHealth) {
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

	async emit(): Promise<void> {
		const data: TJSON = this.toMessage()
		//this._logger && this._logger.log(`Emit health status`)
		this._emitExpandedHealth = !(await this._remoteServer.send(data))
	}

	start (interval: number = 10000): () => void {
		if (typeof this._timer === "undefined") {
			//this._timer = setInterval(this.emit.bind(this), interval)
		}
		if (typeof this._stopTimer === "undefined") {
			this._stopTimer = () => clearInterval(this._timer!)
		}
		return this._stopTimer.bind(this)
	}
}
