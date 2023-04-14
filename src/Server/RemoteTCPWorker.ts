import { Socket } from "net"
import { TJSON, TMessageType, ILogger, IBaseMessage, THealthMessage, messageFromJSON, StopMessage } from "../Common"
import type { IRemoteWorker } from "./RemoteWorker.spec"

export class RemoteTCPWorker implements IRemoteWorker {
	private _connected: boolean = false
	private _messageHandlers: { [k: string]: (data: TJSON) => void } = {}
	private _lastHealth?: IBaseMessage & THealthMessage

	constructor(
		private readonly _logger: ILogger,
		private readonly _socket: Socket
	) {}

	protected _bufferHandler(buf : Buffer){

	}

	get lastHealth() { return this._lastHealth }
	setHealth(v: IBaseMessage & THealthMessage): void {
		this._lastHealth = v
	}
	stop(): void {
		this._messageHandlers = {}
		this._connected = false
		this._logger.log(`Do not listen IPC Worker ${this._socket} anymore`)
		const msg = new StopMessage()
		this.send(msg.toJSON())
	}

	subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
		if (!this._connected) {
			return false
		}
		this._messageHandlers[type] = handler
		return true
	}
	/*	
	private _adrToString():string{
		return "family" in this._adr ? `${this._adr.family}://${this._adr.address}:${this._adr.port}` : ""
	}*/

	listen(): void {
		this._socket.on("data", this._messageHandler.bind(this))
		this._connected = true
		this._logger.log(`Listening TCP Worker ${JSON.stringify(this._socket.address())} ...`)
	}

	private _messageHandler(buffer: Buffer) {
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

	send(data: TJSON): Promise<boolean> {
		if (!this._connected || !this._socket) {
			//this._cleanState()
			return Promise.resolve(false)
		}
		return new Promise((resolve: (v: boolean) => void) => {
			this._socket!.write(JSON.stringify(data), "utf8", (err?: Error) => {
				if (err) {
					this._logger.log(`Error when emitting data to the server: ${err}`)
					resolve(false)
				} else {
					resolve(true)
				}
			})
		})
	}

}