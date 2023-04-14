import { Worker } from "node:cluster";
import {
  TJSON,
  TMessageType,
  IBaseMessage,
  messageFromJSON,
  ILogger,
  THealthMessage,
  StopMessage,
} from "../Common";
import type { Serializable } from "node:child_process";
import { BaseRemoteWorker } from "./BaseRemoteWorker";

export class RemoteIPCWorker extends BaseRemoteWorker {
  constructor(
    protected readonly _logger: ILogger,
    protected readonly _worker: Worker
  ) {
    super(_logger);
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
