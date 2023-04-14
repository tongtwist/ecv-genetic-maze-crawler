import { AddressInfo, Socket } from "node:net";
import type { IRemoteWorker } from "./RemoteWorker.spec";
import {
  IBaseMessage,
  ILogger,
  THealthMessage,
  TJSON,
  TMessageType,
  messageFromJSON,
} from "../Common";

export class RemoteTCPWorker implements IRemoteWorker {
  private readonly _adrr: AddressInfo | {};
  private readonly _remoteWorkerLabel: string;
  private _listening: boolean = false;
  private _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
  private _lastHealth?: IBaseMessage & THealthMessage;

  constructor(
    private readonly _logger: ILogger,
    private readonly _socket: Socket
  ) {
    this._adrr = _socket.address();
    this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`;
  }
  setHealth(v: IBaseMessage & THealthMessage): void {
    this._lastHealth = v;
  }

  subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
    if (!this._listening) {
      return false;
    }
    this._messageHandlers[type] = handler;
    return true;
  }

  private _adrToString(): string {
    return "family" in this._adrr
      ? `${this._adrr.family} ${this._adrr.address}:${this._adrr.port}`
      : "";
  }

  protected _bufferHandler(buf: Buffer) {
    const data = JSON.parse(buf.toString());
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

  listen() {
    this._socket.on("data", this._bufferHandler.bind(this));
    this._listening = true;
    this._logger.log(`Listening TCP Worker ${this._adrToString()} ...`);
  }

  send(data: TJSON): Promise<boolean> {
    if (!this._socket) {
      return Promise.resolve(false);
    }
	
    return new Promise((resolve) => {
      this._socket.write(JSON.stringify(data), () => {
        resolve(true);
      });
    });
  }

  stop(): void {
    this._messageHandlers = {};
    this._listening = false;
    this._logger.log(`Do not listen TCP Worker ${this._adrToString()} anymore`);
    this._socket.end();
  }
}
