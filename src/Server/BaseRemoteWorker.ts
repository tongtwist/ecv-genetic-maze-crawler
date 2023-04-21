import {
	TJSON,
	TMessageType,
	IBaseMessage,
	messageFromJSON,
	ILogger,
	THealthMessage,
	StopMessage
} from "../Common"
import type { IRemoteWorker } from "./RemoteWorker.spec"

export abstract class BaseRemoteWorker implements IRemoteWorker {
	protected _listening: boolean = false
	protected _messageHandlers: { [k: string]: (data: TJSON) => void } = {}
	protected _lastHealth?: IBaseMessage & THealthMessage
	protected _remoteWorkerLabel: string = ""

	constructor (
		protected readonly _logger: ILogger
	) {}
	
	get lastHealth() { return this._lastHealth }

	protected _cleanState() {
		this._listening = false
		this._messageHandlers = {}
	}
	
	protected _messageHandler(data: TJSON) {
		const retMessage = messageFromJSON(data)
		if (retMessage.isSuccess) {
			const message = retMessage.value!
			if (message.type in this._messageHandlers) {
				this._logger.log(`Process ${message.type} message...`)
				this._messageHandlers[message.type](data)
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
			this._messageHandlers[type] = handler
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
}