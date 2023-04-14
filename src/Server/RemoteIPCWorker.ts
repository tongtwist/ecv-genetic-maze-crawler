import { Worker } from "node:cluster"
import {
	TJSON,
	messageFromJSON,
	ILogger, StopMessage,
} from "../Common"
import type { IRemoteWorker } from "./RemoteWorker.spec"
import type { Serializable } from "node:child_process"
import {BaseRemoteWorker} from "../Common/BaseRemoteWorker";

export class RemoteIPCWorker extends BaseRemoteWorker implements IRemoteWorker {

	constructor(
		protected readonly _logger: ILogger,
		private readonly _worker: Worker

	) {
		super( _logger);
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
			this._logger.err(retMessage.error!.message)
		}
	}

	stop() {
		this._messageHandlers = {};
		this._listening = false;
		this._logger.log(`Do not listen IPC Worker ${this._worker.id} anymore`);
		const msg = new StopMessage();
		this._worker.send(msg.toJSON());
	}
	listen() {
		this._worker.on("message", this._messageHandler.bind(this))
		this._listening = true
		this._logger.log(`Listening IPC Worker ${this._worker.id} ...`)
	}

	async send(data: TJSON): Promise<boolean> {
		return this._worker.send(data as Serializable)
	}
}