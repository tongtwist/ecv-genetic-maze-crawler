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
import { Socket } from "node:net";


export class RemoteTCPWorker implements IRemoteWorker {
	private _listening: boolean = false
	private _messageHandlers: { [k: string]: (data: TJSON) => void } = {}
	private _lastHealth?: IBaseMessage & THealthMessage

	constructor(
		private readonly _logger: ILogger,
		private readonly _socket: Socket,
	) {}


	get lastHealth() { return this._lastHealth }

	private _messageHandler(buffer: Buffer) {
		const dataString = buffer.toString()
		const data = JSON.parse(dataString)
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
	
	listen() {
		this._socket.on('data', this._messageHandler.bind(this));
		this._listening = true
		this._logger.log(`Listening TCP Worker ${JSON.stringify(this._socket.address())} ...`)
	}

	stop() {
		this._messageHandlers = {}
		this._listening = false
		this._logger.log(`Do not listen TCP Worker ${this._socket} anymore`)
		const msg = new StopMessage()
		this._socket.write(msg.toString())
	  }

	async send(data: TJSON): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			if (!this._socket) {
			  reject(new Error('Not connected'));
			  return;
			}
	  
			const jsonData = JSON.stringify(data);
			this._socket.write(jsonData, (err) => {
			  if (err) {
				console.error(`Error sending data: ${err.message}`);
				reject(err);
			  } else {
				resolve(true);
			  }
			});
		  });
	}

	subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
		if (!this._listening) {
			return false
		}
		this._messageHandlers[type] = handler
		return true
	}

	close() {
		this._socket && this._socket.end()
	}

}