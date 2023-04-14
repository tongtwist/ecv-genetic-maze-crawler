import { Worker } from "node:cluster";
import { TJSON, messageFromJSON, ILogger, StopMessage } from "../Common";
import type { IRemoteWorker } from "./RemoteWorker.spec";
import type { Serializable } from "node:child_process";
import { RemoteWorker } from "../Common/RemoteWorker";

export class RemoteIPCWorker extends RemoteWorker implements IRemoteWorker {
  constructor(
    protected readonly _logger: ILogger,
    private readonly _worker: Worker
  ) {
    super(_logger);
  }

  stop() {
    this._messageHandlers = {};
    this._listening = false;
    this._logger.log(`Do not listen IPC Worker ${this._worker.id} anymore`);
    const msg = new StopMessage();
    this._worker.send(msg.toJSON());
  }
  listen() {
    this._worker.on("message", this._messageHandler.bind(this));
    this._listening = true;
    this._logger.log(`Listening IPC Worker ${this._worker.id} ...`);
  }

  async send(data: TJSON): Promise<boolean> {
    return this._worker.send(data as Serializable);
  }
}
