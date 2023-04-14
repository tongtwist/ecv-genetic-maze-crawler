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
import { BaseRemoteWorker } from "./BaseRemoteWorker";

export class RemoteTCPWorker extends BaseRemoteWorker implements IRemoteWorker {
  private readonly _adr: AddressInfo | {};
  private readonly _remoteWorkerLabel: string;

  constructor(
    protected readonly _logger: ILogger,
    private readonly _socket: Socket
  ) {
    super(_logger);
    this._adr = this._socket.address();
    this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`;
  }

  // renvoie une chaîne de caractères.
  private _adrToString(): string {
    return "family" in this._adr
      ? `${this._adr.family}://${this._adr.address}:${this._adr.port}`
      : "";
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

    this._socket.on("connect", () => {
      this._connected = true;
      this._logger.log(`${this._remoteWorkerLabel} connected`);
    });

    this._socket.on("data", (data) => {
      const dataStr = data.toString();
      const dataJSON = JSON.parse(dataStr);
      const handler = this._messageHandlers[dataJSON.type];
      if (handler) {
        handler(dataJSON.data);
      }
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
    return new Promise<boolean>((resolve, reject) => {
      const message = JSON.stringify(data);
      this._socket.write(message, "utf8", (err) => {
        if (err) {
          this._logger.log(`Error sending message: ${err.message}`);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
