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
import type { IRemoteWorker } from "./RemoteWorker.spec";
import { AddressInfo } from "node:net";
import { Socket } from "net";

export class RemoteTCPWorker implements IRemoteWorker {
  private readonly _adr: AddressInfo | {};
  private readonly _remoteWorkerLabel: string;
  private _connected: boolean = false;
  private _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
  private _lastHealth?: IBaseMessage & THealthMessage;

  constructor(
    private readonly _logger: ILogger,
    private readonly _socket: Socket
  ) {
    this._adr = this._socket.address();
    this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`;
  }

  private _cleanState() {
    this._connected = false;
    this._messageHandlers = {};
  }

  get lastHealth() {
    return this._lastHealth;
  }

  private _adrToString(): string {
    return "family" in this._adr
      ? `${this._adr.family}://${this._adr.address}:${this._adr.port}`
      : "";
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

  listen() {
    this._socket.on("ready", () => {
      this._logger.log(`TCP Worker ${this._remoteWorkerLabel} ready`);
    });

    this._socket.on("timeout", () => {
      this._logger.log(`TCP Worker ${this._remoteWorkerLabel} timeout`);
    });

    this._socket.on("error", (err) => {
      this._logger.err(`TCP Worker ${this._remoteWorkerLabel} error: ${err}`);
    });

    this._socket.on("close", (hadError) => {
      this._logger.log(
        `TCP Worker ${this._remoteWorkerLabel} closed: ${hadError}`
      );
    });
    this._socket.on("data", (data) => {
      const dataStr = data.toString();
      const dataJSON = JSON.parse(dataStr);
      this._messageHandler(dataJSON);
    });
  }

  stop() {
    this._socket && this._socket.end();
  }

  async send(data: TJSON): Promise<boolean> {
    if (this._socket === null) {
      return Promise.reject(
        `Not connected to TCP Worker ${this._remoteWorkerLabel}`
      );
    }
    return new Promise<boolean>((resolve) => {
      this._socket?.write(JSON.stringify(data), () => {
        resolve(true);
      });
    });
  }

  subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
    if (!this._connected || !this._socket) {
      this._cleanState();
      return false;
    }
    this._messageHandlers[type] = handler;
    return true;
  }
}
