import { TJSON, ILogger, IMaze } from "../Common"
import {
	messageFromJSON,
	THealthMessage,
	StopMessage,
	MazeMessage,
	SimulateMessage
} from "../Message"
import type {TMessageType,IBaseMessage,} from "../Message.spec"
import type { IRemoteWorker } from "./RemoteWorker.spec"

export abstract class BaseRemoteWorker implements IRemoteWorker {
	protected _listening: boolean = false
	protected readonly _messageHandlers: Map<TMessageType, (data: TJSON) => void> = new Map()
	protected _lastHealth?: IBaseMessage & THealthMessage
	protected _remoteWorkerLabel: string = ""

	constructor (
		protected readonly _logger: ILogger
	) {}
	
	get label() {return this._remoteWorkerLabel}
	get lastHealth() { return this._lastHealth }

	protected _cleanState() {
		this._listening = false
		this._messageHandlers.clear()
	}
	
	protected _messageHandler(data: TJSON) {
		const retMessage = messageFromJSON(data)
		if (retMessage.isSuccess) {
			const message = retMessage.value!
			const handler = this._messageHandlers.get(message.type)
			if (handler) {
				this._logger.log(`Process ${message.type} message...`)
				handler(data)
			} else {
				this._logger.log(`Unhandled message "${message.type}"`)
			}
		} else {
			this._logger.err(retMessage.error!.message)
		}
	}

	setHealth(v: IBaseMessage & THealthMessage) {
		this._lastHealth = v
	}

	abstract listen(): void
	abstract send(data: TJSON): Promise<boolean>

	subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
		if (this._listening) {
			this._messageHandlers.set(type, handler)
			return true
		}
		return false
	}

	stop(): Promise<boolean> {
		this._cleanState()
		this._logger.log(`Do not listen ${this._remoteWorkerLabel} anymore`)
		const msg = new StopMessage()
		return this.send(msg.toJSON())
	}

	setMaze(maze: IMaze): Promise<boolean> {
		this._logger.log(`Set maze for ${this._remoteWorkerLabel}...`)
		const msg = new MazeMessage(maze)
		return this.send(msg.toJSON())
	}

	async simulate(nbGeneration: number, growthRate?: number): Promise<boolean> {
		this._logger.log(`Simulate ${nbGeneration} generations...`)
		const msg = new SimulateMessage(nbGeneration, growthRate ?? 1)
		return await this.send(msg.toJSON())
	}
}