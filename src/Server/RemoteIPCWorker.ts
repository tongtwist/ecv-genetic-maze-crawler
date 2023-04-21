import { Worker } from "node:cluster"
import type { Serializable } from "node:child_process"
import type {TJSON,ILogger} from "../Common"
import { BaseRemoteWorker } from "./BaseRemoteWorker"
import type { IRemoteWorker } from "./RemoteWorker.spec"

export class RemoteIPCWorker extends BaseRemoteWorker implements IRemoteWorker {
	constructor(
		readonly _logger: ILogger,
		private readonly _worker: Worker
	) {
		super(_logger)
		this._remoteWorkerLabel = `IPC Worker ${_worker.id}`
	}

	listen() {
		this._worker.on("message", this._messageHandler.bind(this))
		this._listening = true
		this._logger.log(`Listening ${this._remoteWorkerLabel} ...`)
	}

	async send(data: TJSON): Promise<boolean> {
		return this._worker.send(data as Serializable)
	}
}