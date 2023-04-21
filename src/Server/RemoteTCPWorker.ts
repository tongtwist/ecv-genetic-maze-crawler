import { AddressInfo, Socket } from "net"
import type {TJSON,ILogger} from "../Common"
import { BaseRemoteWorker } from "./BaseRemoteWorker"
import type { IRemoteWorker } from "./RemoteWorker.spec"

export class RemoteTCPWorker extends BaseRemoteWorker implements IRemoteWorker {
	private readonly _adr: AddressInfo | {}

	constructor(
		readonly _logger: ILogger,
		private readonly _socket: Socket
	) {
		super(_logger)
		this._adr = this._socket.address()
		this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`
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
			data = JSON.parse(txt)
		} catch(e) {
			this._logger.err(`-> Invalid JSON data: ${(e as Error).message}`)
			return
		}
		this._messageHandler(data)
	}

	listen() {
		this._socket.on("data", this._bufferHandler.bind(this))
		this._listening = true
		this._logger.log(`Listening ${this._remoteWorkerLabel} ...`)
	}

	send(data: TJSON): Promise<boolean> {
		const txt = JSON.stringify(data)
		return new Promise(
			(resolve: (v: boolean) => void) => this._socket.write(
				txt,
				"utf-8",
				(error?: Error | null) => resolve(!!error)
			)
		)
	}
}