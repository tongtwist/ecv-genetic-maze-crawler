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

export class RemoteTCPWorker implements IRemoteWorker {
	private _listening: boolean = false
	private _messageHandlers: { [k: string]: (data: TJSON) => void } = {}
	private _lastHealth?: IBaseMessage & THealthMessage
	private _socket?: net.Socket;
	
	constructor(
		private readonly _logger: ILogger,
		private readonly _host: string,
		private readonly _port: number,
	) {
		this._listening = true;
	}
	
	get lastHealth() { return this._lastHealth }

	private _messageHandler(data: string) {
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

	protected _bufferHandler(buf:Buffer){
		
	}

	listen() {
		this._socket = net.connect({port: this._port, host: this._host});
		this._socket.on('data', (data) => {
			this._messageHandler(data.toString())
		});
	}	

	stop() {
		this._messageHandlers = {}
		this._listening = false
		this._logger.log(`Do not listen IPC Worker anymore`)
		const msg = new StopMessage()	
	}


	async send(data:TJSON): Promise<boolean> {
		return new Promise((resolve, reject) => {
			if (!this._socket) {
				reject(false)
			}
			this._socket!.write(JSON.stringify(data), (err) => {
				if (err) {
					reject(false)
				}
				resolve(true)
			})
		})
	}

	subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
		if (!this._listening) {
			return false
		}
		this._messageHandlers[type] = handler
		return true
	}
}