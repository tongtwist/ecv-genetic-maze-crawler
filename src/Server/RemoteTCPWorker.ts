import { AddressInfo, Socket } from "net"
import type {TJSON,ILogger} from "../Common"
import { BaseRemoteWorker } from "./BaseRemoteWorker"
import type { IRemoteWorker } from "./RemoteWorker.spec"

export class RemoteTCPWorker extends BaseRemoteWorker implements IRemoteWorker {
	private readonly _adr: AddressInfo | {}
	private _pendingTxt: string = ""

	constructor(
		readonly _logger: ILogger,
		private readonly _socket: Socket
	) {
		super(_logger)
		this._adr = this._socket.address()
		this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`
		this._socket.setKeepAlive(true)
		this._socket.setNoDelay(true)
	}

	private _adrToString(): string {
		return "family" in this._adr
			? `${this._adr.family}://${this._adr.address}:${this._adr.port}`
			: ""
	}
	
	protected _bufferHandler(buf: Buffer) {
		const txt = buf.toString("utf-8")
		let data: TJSON
		try {
			data = JSON.parse(this._pendingTxt + txt)
		} catch(e) {
			if ((e as Error).message === "Unexpected end of JSON input") {
				this._pendingTxt += txt
			} else {
				this._logger.err(`-> Invalid JSON data: ${(e as Error).message}, ("${txt}")`)
			}
			return
		}
		this._messageHandler(data)
		this._pendingTxt = ""
	}

	listen() {
		this._socket.on("data", this._bufferHandler.bind(this))
		this._listening = true
		this._logger.log(`Listening ${this._remoteWorkerLabel} ...`)
	}

	send(data: TJSON): Promise<boolean> {
		const txt = JSON.stringify(data)
		return new Promise(
			(resolve: (v: boolean) => void, reject: (reason?: any) => void) => this._socket.write(
				txt,
				"utf-8",
				(error?: Error | null) => {
					if (error) {
						this._logger.err(`-> Error sending data: ${error.message}`)
						reject(error)
					}
					resolve(!!error)
				}
			)
		)
	}
}