import net from "net"
import {
	TJSON,
	ILogger,
	IBaseMessage,
	THealthMessage,
	TMessageType,
	messageFromJSON,
	StopMessage,
} from "../Common"
import type { IRemoteWorker } from "./RemoteWorker.spec"

export abstract class BaseRemoteWorker
 {
    protected _listening: boolean = false
    protected _messageHandlers: { [k: string]: (data: TJSON) => void } = {}
    protected _lastHealth?: IBaseMessage & THealthMessage

    constructor(		
        protected readonly _logger: ILogger,
	) {
		this._listening = true;
    }

    get lastHealth() { return this._lastHealth }

    
	protected _messageHandler(data: string) {
		const json = JSON.parse(data);
		const retMessage = messageFromJSON(json)
		if (retMessage.isSuccess) {
			const message = retMessage.value!
			if (message.type in this._messageHandlers) {
				this._logger.log(`-> Process ${message.type} message...`)
				this._messageHandlers[message.type](json)
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
		this._logger.log(`Do not listen IPC Worker anymore`)
		const msg = new StopMessage()	
	}

    subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
		if (!this._listening) {
			return false
		}
		this._messageHandlers[type] = handler
		return true
	}

}