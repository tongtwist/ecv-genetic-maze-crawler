import { Socket, createConnection } from "net"
import type { TJSON, ILogger } from "../Common"
import { BaseRemoteServer } from "./BaseRemoteServer"
import type { IRemoteServer } from "./RemoteServer.spec"

export class RemoteServer extends BaseRemoteServer implements IRemoteServer {
	private _socket?: Socket

	constructor(
		readonly _logger: ILogger,
		private readonly _host: string,
		private readonly _port: number,
	) {
		super(_logger)
	}

	protected _cleanState() {
		super._cleanState()
		this._socket = undefined
	}

	connect(): Promise<boolean> {
		if (this._connected && !!this._socket) {
			return Promise.resolve(true)
		}
		this._cleanState()
		return new Promise((resolve: (v: boolean) => void) => {
			const timeout = 5000
			this._socket = createConnection({
				port: this._port,
				host: this._host,
				keepAlive: true,
				noDelay: true,
			}, () => {
				this._logger.log(`TCP connection established with ${this._host}:${this._port}`)
			})
			this._socket.setKeepAlive(true)
			this._socket.setNoDelay(true)
			this._socket.on("close", () => {
				this._logger.log("Disconnected")
				this._cleanState()
			})
			this._socket.on("ready", () => {
				this._logger.log("Connected")
				this._connected = true
				resolve(true)
			})
			this._socket.on("error", (err: Error) => {
				this._logger.log(`TCP socket emitted an error: ${err.message}`)
				this._cleanState()
			})
			this._socket.on("timeout", () => {
				if (!this._connected) {
					this._logger.log(`Connection timeout. It takes more than ${timeout}ms to connect to server`)
					this._cleanState()
				}
			})
			this._socket.on("data", (data: Buffer) => {
				const txt = data.toString()
				this._logger.log(`Received ${data.length} bytes`)
				let j: TJSON | undefined
				try {
					j = JSON.parse(txt)
				} catch(e) {
					this._logger.log(`The received data is not a valid JSON and cannot be processed: ${e}`)
				}
				if (typeof j !== undefined) {
					this._messageHandler(j!)
				}
			})
		})
	}

	close() {
		this._socket && this._socket.end()
	}

	send(data: TJSON): Promise<boolean> {
		if (!this._connected || !this._socket) {
			this._cleanState()
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