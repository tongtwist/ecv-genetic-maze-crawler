import net from "net"
import {
	TJSON,
	ILogger,
} from "../Common"
import type { IRemoteWorker } from "./RemoteWorker.spec"
import { BaseRemoteWorker } from "./BaseRemoteWorker"

export class RemoteTCPWorker extends BaseRemoteWorker implements IRemoteWorker {
	private _socket?: net.Socket;
	
	constructor(
		_logger: ILogger,
		private readonly _host: string,
		private readonly _port: number,
	) {
		super(_logger);
	}
	

	protected _bufferHandler(buf:Buffer){
		
	}

	listen() {
		this._socket = net.connect({port: this._port, host: this._host});
		this._socket.on('data', (data) => {
			this._messageHandler(data.toString())
		});
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

}