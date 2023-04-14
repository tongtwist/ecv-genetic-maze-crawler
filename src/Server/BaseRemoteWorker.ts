import { IRemoteWorker } from "./RemoteWorker.spec";
import {
  TJSON,
  TMessageType,
  IBaseMessage,
  messageFromJSON,
  ILogger,
  THealthMessage,
  StopMessage,
} from "../Common";

export abstract class BaseRemoteWorker implements IRemoteWorker {
  protected _listening: boolean = false;
  protected _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
  protected _lastHealth?: IBaseMessage & THealthMessage;

  constructor(protected readonly _logger: ILogger) {}

  get lastHealth() {
    return this._lastHealth;
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

  subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
    if (!this._listening) {
      return false;
    }

    this._messageHandlers[type] = handler;
    return true;
  }

  stop(): void {
    this._messageHandlers = {};
    this._listening = false;
    this._logger.log(`Stop to listen TCP Worker`);
    const msg = new StopMessage();
    this.send(msg.toJSON());
  }

  abstract send(data: TJSON): Promise<boolean>;
  abstract listen(): void;
}
