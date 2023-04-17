import {
  IBaseMessage,
  ILogger,
  StopMessage,
  THealthMessage,
  TJSON,
  TMessageType,
  messageFromJSON,
} from "../Common";
import { IRemoteWorker } from "./RemoteWorker.spec";

export abstract class BaseRemoteWorker implements IRemoteWorker {
  protected _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
  protected _listening: boolean = false;
  protected _remoteWorkerLabel: string;
  protected _lastHealth?: IBaseMessage & THealthMessage;

  constructor(protected readonly _logger: ILogger) {
    this._remoteWorkerLabel = "Base Remote Worker";
  }

  abstract listen(): void;
  abstract send(data: TJSON): Promise<boolean>;

  subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
    if (!this._listening) {
      return false;
    }
    this._messageHandlers[type] = handler;
    return true;
  }

  protected _messageHandler(data: TJSON) {
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

  get lastHealth() {
    return this._lastHealth;
  }

  stop(): void {
    this._messageHandlers = {};
    this._listening = false;
    this._logger.log(`Do not listen ${this._remoteWorkerLabel} anymore`);
    const msg = new StopMessage();
    this.send(msg.toJSON());
  }
}
