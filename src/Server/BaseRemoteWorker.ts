import {
	TJSON,
	TMessageType,
	IBaseMessage,
	messageFromJSON,
	ILogger,
	THealthMessage,
	StopMessage
} from "../Common"
import {Socket} from "net";

export abstract class BaseRemoteWorker {
    protected _lastHealth?: IBaseMessage & THealthMessage
    protected _messageHandlers: { [k: string]: (data: TJSON) => void } = {}
    protected _listening: boolean = false

    constructor(
        protected readonly _logger: ILogger,
    ) {
    }



    get lastHealth() { return this._lastHealth }

    _messageHandler(data: TJSON) {
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

	setHealth(v: IBaseMessage & THealthMessage): void {
		this._lastHealth = v
	}

    stop() {
		this._messageHandlers = {}
		this._listening = false
		// this._logger.log(`Do not listen IPC Worker ${this._worker.id} anymore`)
		const msg = new StopMessage()
		this.send(msg.toJSON())
	}

    subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
		if (!this._listening) {
			return false
		}
		this._messageHandlers[type] = handler
		return true
	}

    abstract send(data: TJSON): Promise<boolean>
    abstract listen(): void

}