import { TJSON, messageFromJSON, ILogger } from "../Common"
import type { IRemoteServer } from "./RemoteServer.spec"

export abstract class BaseRemoteServer implements IRemoteServer {
	protected _connected: boolean = false
	protected _messageHandlers: { [k: string]: (data: TJSON) => void } = {}

	constructor(
		protected readonly _logger: ILogger
	) {}

	protected _cleanState() {
		this._connected = false
		this._messageHandlers = {}
	}

	protected _messageHandler(data: TJSON) {
		const retMessage = messageFromJSON(data)
		if (retMessage.isSuccess) {
			const message = retMessage.value!
			if (message.type in this._messageHandlers) {
				this._logger.log(`Process ${message.type} message...`)
				this._messageHandlers[message.type](data)
			} else {
				this._logger.log(`Unhandled message "${message.type}"`)
			}
		} else {
			this._logger.err(retMessage.error!.message)
		}
	}

	abstract connect(): Promise<boolean>
	abstract close(): void
	abstract send(data: TJSON): Promise<boolean>

	subscribe(type: string, handler: (data: TJSON) => void): boolean {
		if (!this._connected) {
			return false
		}
		this._messageHandlers[type] = handler
		return true
	}
}