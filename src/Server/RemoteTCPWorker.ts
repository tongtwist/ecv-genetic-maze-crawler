import { Socket } from "net"
import { TJSON, ILogger } from "../Common"
import type { IRemoteWorker } from "./RemoteWorker.spec"
import { BaseRemoteWorker } from "./BaseRemoteWorker"

export class RemoteTCPWorker extends BaseRemoteWorker implements IRemoteWorker {
	constructor(
		readonly _logger: ILogger,
		private readonly _socket: Socket
	) {
		super(_logger)
		this.workerLabel = 'TCP Worker'
	}

	protected _bufferHandler(buf : Buffer){

	}

	listen(): void {
		this._socket.on("data", this._messageHandler.bind(this))
		this._connected = true
		this._logger.log(`Listening TCP Worker ${JSON.stringify(this._socket.address())} ...`)
	}
/*	
	private _adrToString():string{
		return "family" in this._socket ? `${this._socket.family}://${this._socket.address}:${this._socket.port}` : ""
	}
*/

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