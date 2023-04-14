import {
  IBaseMessage,
  ILogger,
  THealthMessage,
  TJSON,
  TMessageType,
  messageFromJSON,
} from "../Common";

export abstract class BaseRemoteWorker {
  protected _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
  protected _lastHealth?: IBaseMessage & THealthMessage;
  protected _listening: boolean = false;
  protected _connected: boolean = false;

  constructor(protected _logger: ILogger) {}

  protected _messageHandler(data: TJSON) {
    const retMessage = messageFromJSON(data);
    if (retMessage.isSuccess) {
      const message = retMessage.value!;
      if (message.type in this._messageHandlers) {
        this._logger.log(`-> Hello from ${message.hostname} IPC Worker`);
        this._messageHandlers[message.type](data);
      } else {
        this._logger.log(`-> Hello from ${message.hostname} TCP Worker`);
      }
    } else {
      this._logger.log(retMessage.error!.message);
    }
  }
  setHealth(v: IBaseMessage & THealthMessage): void {
    this._lastHealth = v;
  }
  protected _cleanState() {
    this._connected = false;
    this._messageHandlers = {};
  }
  subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
    if (!this._listening) {
      return false;
    }
    this._messageHandlers[type] = handler;
    return true;
  }
  getLastHealth() {
    return this._lastHealth;
  }
}
