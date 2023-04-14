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
import { Socket } from "net";
import { AddressInfo } from "node:net";
// import { Worker } from "cluster";

export class RemoteTCPWorker implements IRemoteWorker {
  private readonly _adr: AddressInfo | {};
  private readonly _remoteWorkerLabel: string;
  private _listening: boolean = false;
  private _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
  private _lastHealth?: IBaseMessage & THealthMessage;

  constructor(private _logger: ILogger, private readonly _socket: Socket) {
    // Initialisation des propriétés de la classe
    this._adr = this._socket.address();
    this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`;
  }

  // Convertit l'adresse du socket en une chaîne de caractères
  private _adrToString(): string {
    return "family" in this._adr
      ? `${this._adr.family}://${this._adr.address}:${this._adr.port}`
      : "";
  }

  private _bufferHandler(buf: Buffer) {
    const dataStr = buf.toString();
    const dataJSON = JSON.parse(dataStr);
    this._messageHandler(dataJSON);
  }

  // Ecoute les données envoyées via TCP
  listen() {
    this._logger.log(`Connected TCP Worker`);

    // Déclenché lorsque des données sont reçues via TCP
    this._socket.on("data", (data) => {
      const dataStr = data.toString();
      const dataJSON = JSON.parse(dataStr);
      this._messageHandler(dataJSON);
    });

    // Déclenché lorsque la connexion TCP est fermée
    this._socket.on("end", () => {
      this._logger.log(`TCP Worker disconnected ${this._adrToString()}`);
    });
  }

  // Envoye des données via la connexion TCP
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

  // Gére les messages reçus via la connexion TCP
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
    this._socket && this._socket.end();
  }

  subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
    if (!this._listening) {
      return false;
    }
    this._messageHandlers[type] = handler;
    return true;
  }
}
