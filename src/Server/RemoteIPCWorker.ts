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
import { IRemoteWorker } from "./RemoteWorker.spec";
import type { Serializable } from "node:child_process";

export class RemoteIPCWorker implements IRemoteWorker {
  private _listening: boolean = false;
  private _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
  private _lastHealth?: THealthMessage & IBaseMessage;

  constructor(
    private readonly _worker: Worker,
    private readonly _logger: ILogger
  ) {}

  get lastHealth() {
    return this._lastHealth;
  }

  private _messageHandler(data: TJSON) {
    const retMessage = messageFromJSON(data);
    if (retMessage.isSuccess) {
      const message = retMessage.value!;
      if (message.type in this._messageHandlers) {
        this._logger.log(`-> Process ${message.type} message...`);
        this._messageHandlers[message.type](data);
      } else {
        this._logger.log(`-> Skip "${message.type}" message type`);
      }
    }
  }

  setHealth(v: THealthMessage & IBaseMessage) {
    this._lastHealth = v;
  }

  listen() {
    this._worker.on("message", this._messageHandler.bind(this));
    this._listening = true;
    this._logger.log(`Listening IPC Worker ${this._worker.id} ...`);
  }

  stop(): void {
    this._messageHandlers = {};
    this._listening = false;
    this._logger.log(`Do not listen IPC Worker ${this._worker.id} anymore`);
    const msg = new StopMessage();
    this._worker.send(msg.toJson());
  }

  async send(data: TJSON): Promise<boolean> {
    return this._worker.send(data as Serializable);
  }

  subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
    if (!this._listening) return false;
    this._messageHandlers[type] = handler;
    return true;
  }
}
