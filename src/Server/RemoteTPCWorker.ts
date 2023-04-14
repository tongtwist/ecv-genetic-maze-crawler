import {
  TJSON,
  TMessageType,
  IBaseMessage,
  messageFromJSON,
  ILogger,
  THealthMessage,
  StopMessage,
} from "../Common";
import type { IRemoteWorker } from "./RemoteWorker.spec";
import type { Serializable } from "node:child_process";
import { Socket } from "net";
import { AddressInfo } from "node:net";

export class RemoteTPCWorker implements IRemoteWorker {
  private readonly _adr: AddressInfo | {};
  private _listening: boolean = false;
  private _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
  private _lastHealth?: IBaseMessage & THealthMessage;

  constructor(
    private _logger: ILogger,
    private readonly _socket: Socket,
    private readonly _worker: Worker
  ) {
    this._adr = this._socket.address();
    this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`;
  }

  private _adrToString(): string {
    return "family" in this._adr
      ? `${this._adr.family}://${this._adr.address}:${this._adr.port}`
      : "";
  }

  listen() {
    this._logger.log(`Connected TCP Worker`);

    this._socket.on("data", (data) => {
      const dataStr = data.toString();
      const dataJSON = JSON.parse(dataStr);
      this._messageHandler(dataJSON);
    });

    this._socket.on("end", () => {
      this._logger.log(`TCP Worker disconnected ${this._adrToString()}`);
    });
  }

  async send(data: TJSON): Promise<boolean> {
    if (!this._socket) {
      return Promise.reject(
        `Not connected to TCP Worker ${this._adrToString()}`
      );
    }

    return new Promise((resolve) => {
      this._socket.write(JSON.stringify(data), () => {
        resolve(true);
      });
    });
  }

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
    } else {
      this._logger.err(retMessage.error!.message);
    }
  }

  setHealth(v: IBaseMessage & THealthMessage): void {
    this._lastHealth = v;
  }

  stop() {
    this._messageHandlers = {};
    this._listening = false;
    this._logger.log(`Do not listen IPC Worker ${this._worker.id} anymore`);
    const msg = new StopMessage();
    this._worker.send(msg.toJSON());
  }

  subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
    if (!this._listening) {
      return false;
    }
    this._messageHandlers[type] = handler;
    return true;
  }
}
