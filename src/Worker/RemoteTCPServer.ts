import { Socket, createConnection } from "net"
import { TJSON, TMessageType, messageFromJSON, ILogger } from "../Common"
import type { IRemoteServer } from "./RemoteServer.spec"

export class RemoteServer implements IRemoteServer {
	private _socket?: Socket
	private _connected: boolean = false
	private _messageHandlers: { [k: string]: (data: TJSON) => void } = {}

	constructor(
		private readonly _logger: ILogger,
		private readonly _host: string,
		private readonly _port: number,
	) {}

	private _cleanState() {
		this._connected = false
		this._messageHandlers = {}
		this._socket = undefined
	}
	
	private _messageHandler(data: TJSON) {
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
			this._logger.log(retMessage.error!.message)
		}
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
				timeout
			}, () => {
				this._logger.log(`TCP connection established with ${this._host}:${this._port}`)
			})
			this._socket.on("close", () => {
				this._logger.log(`Disconnected from ${this._host}:${this._port}`)
				this._cleanState()
			})
			this._socket.on("ready", () => {
				this._logger.log(`Ready to work with ${this._host}:${this._port}`)
				this._connected = true
				resolve(true)
			})
			this._socket.on("error", (err: Error) => {
				this._logger.log(`TCP socket to ${this._host}:${this._port} emitted an error(${err.name}): ${err.message}`)
				this._cleanState()
			})
			this._socket.on("timeout", () => {
				this._logger.log(`Connection timeout. It takes more than ${timeout}ms to connect to ${this._host}:${this._port}`)
				this._cleanState()
			})
			this._socket.on("data", (data: Buffer) => {
				const txt = data.toString()
				this._logger.log(`Received ${data.length} bytes from ${this._host}:${this._port} ("${txt}")`)
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

	subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
		if (!this._connected || !this._socket) {
			this._cleanState()
			return false
		}
		this._messageHandlers[type] = handler
		return true
	}
}