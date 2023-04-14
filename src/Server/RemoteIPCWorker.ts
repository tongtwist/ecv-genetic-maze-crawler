import { Worker } from "node:cluster";
import { TJSON, ILogger, StopMessage } from "../Common";
import type { IRemoteWorker } from "./RemoteWorker.spec";
import type { Serializable } from "node:child_process";
import { BaseWorker } from "./BaseRemoteWorker";

export class RemoteIPCWorker extends BaseWorker implements IRemoteWorker {
    constructor(protected readonly _logger: ILogger, readonly _worker: Worker) {
        super(_logger);
    }

    listen() {
        this._worker.on("message", this._messageHandler.bind(this));
        this._listening = true;
        this._logger.log(`Listening IPC Worker ${this._worker.id} ...`);
    }

    stop() {
        this._messageHandlers = {};
        this._listening = false;
        this._logger.log(`Do not listen IPC Worker ${this._worker.id} anymore`);
        const msg = new StopMessage();
        this._worker.send(msg.toJSON());
    }

    async send(data: TJSON): Promise<boolean> {
        return this._worker.send(data as Serializable);
    }
}
