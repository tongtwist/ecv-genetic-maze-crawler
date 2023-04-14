import { Worker } from "node:cluster"
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
import type { Serializable } from "node:child_process"
import { Socket } from "node:net";
import { RemoteIPCWorker } from './RemoteIPCWorker';
import { BaseRemoteWorker } from "./BaseRemoteWorker";

export class RemoteTCPWorker extends BaseRemoteWorker implements IRemoteWorker {

	constructor(
        protected readonly _logger: ILogger,
        protected readonly _socket: Socket      
    ) {
		super(_logger)
		this._workerLabel = `TCP Worker ${JSON.stringify(this._socket.address())}`
	}

	private _messageHandler(buffer: Buffer) {
		const dataString = buffer.toString()
		const data = JSON.parse(dataString)
		this._message(data)
	}

	
	listen() {
		this._socket.on('data', this._messageHandler.bind(this));
		this._listening = true
		this._logger.log(`Listening TCP Worker ${JSON.stringify(this._socket.address())} ...`)
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

	close() {
		this._socket && this._socket.end()
	}

}