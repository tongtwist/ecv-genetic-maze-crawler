import { Worker } from 'node:cluster'
import { TJSON, ILogger } from '../Common'
import type { IRemoteWorker } from './RemoteWorker.spec'
import type { Serializable } from 'node:child_process'
import { AbstractRemoteWorker } from './AbstractRemoteWorker'

export class RemoteIPCWorker
    extends AbstractRemoteWorker
    implements IRemoteWorker
{
    constructor(
        protected readonly _logger: ILogger,
        private readonly _worker: Worker
    ) {
        super(_logger)
        this._remoteWorkerLabel = `IPC Worker ${this._worker.id}`
    }

    listen() {
        this._worker.on('message', this._messageHandler.bind(this))
        this._listening = true
        this._logger.log(`Listening IPC Worker ${this._worker.id} ...`)
    }

    async send(data: TJSON): Promise<boolean> {
        return this._worker.send(data as Serializable)
    }
}
