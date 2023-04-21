import process from "node:process"
import type { TMessageType } from "../Message.spec"
import { messageFromJSON } from "../Message"
import { TJSON, ILogger } from "../Common"
import { BaseRemoteServer } from "./BaseRemoteServer"
import type { IRemoteServer } from "./RemoteServer.spec"

export class RemoteServer extends BaseRemoteServer implements IRemoteServer {
	constructor(
		readonly _logger: ILogger
	) {
		super(_logger)
	}

	async connect(): Promise<boolean> {
		process.on("message", this._messageHandler.bind(this))
		this._connected = true
		this._logger.log("Connected")
		return this._connected
	}

	close() {
		process.off("message", this._messageHandler.bind(this))
		this._messageHandlers = {}
		this._connected = false
	}

	async send(data: TJSON): Promise<boolean> {
		return this._connected && !!process.send && process.send(data)
	}
}