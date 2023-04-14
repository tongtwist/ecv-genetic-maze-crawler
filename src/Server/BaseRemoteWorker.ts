import { TJSON, TMessageType, ILogger, IBaseMessage, THealthMessage, messageFromJSON, StopMessage } from "../Common"
import type { IRemoteWorker } from "./RemoteWorker.spec"

export abstract class BaseRemoteWorker implements IRemoteWorker {
	protected _connected: boolean = false
	protected _messageHandlers: { [k: string]: (data: TJSON) => void } = {}
	protected _lastHealth?: IBaseMessage & THealthMessage
    protected workerLabel : string = ''

	constructor(
		protected readonly _logger: ILogger,
	) {}

	get lastHealth() { return this._lastHealth }
	
    setHealth(v: IBaseMessage & THealthMessage): void {
		this._lastHealth = v
	}
    
    //Identique
	stop(): void {
		this._messageHandlers = {}
		this._connected = false
		this._logger.log(`Do not listen ${this.workerLabel} anymore`)
		const msg = new StopMessage()
		this.send(msg.toJSON())
	}

    //Identique
	subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
		if (!this._connected) {
			return false
		}
		this._messageHandlers[type] = handler
		return true
	}
    
	abstract listen(): void
    

    //identique ?
	protected _messageHandler(buffer: Buffer) {
		var data :TJSON = JSON.parse(buffer.toString())
		const retMessage = messageFromJSON(data)
		if (retMessage.isSuccess) {
			const message = retMessage.value!
			if (message.type in this._messageHandlers) {
				this._logger.log(`-> Process ${message.type} message...`)
				this._messageHandlers[message.type](data)
			} else {
				this._logger.log(`-> Skip "${message.type}" message type`)
			}
		} else {
			this._logger.err(retMessage.error!.message)
		}
	}

    
	abstract send(data: TJSON): Promise<boolean>

}