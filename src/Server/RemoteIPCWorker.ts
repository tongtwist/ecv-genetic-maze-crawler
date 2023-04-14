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
import { RemoteTCPWorker } from "./RemoteTCPWorker"
import { BaseRemoteWorker } from "./BaseRemoteWorker"

export class RemoteIPCWorker extends BaseRemoteWorker implements IRemoteWorker {

	constructor(
		protected readonly _logger: ILogger,
		protected readonly _worker: Worker,
       
    ) {
		super(_logger)
		this._workerLabel = `IPC Worker ${this._worker.id}`
	}

	private _messageHandler(data: TJSON) {
		this._message(data)	
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