import {
  IBaseMessage,
  ILogger,
  THealthMessage,
  TJSON,
  TMessageType,
  messageFromJSON,
} from "../Common";

export abstract class BaseRemoteWorker {
  protected _lastHealth?: IBaseMessage & THealthMessage;
  protected _connected: boolean = false;
  protected _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
  protected _listening: boolean = false;
  constructor(protected readonly _logger: ILogger) {}

  protected _cleanState() {
    this._connected = false;
    this._messageHandlers = {};
  }

  setHealth(v: IBaseMessage & THealthMessage): void {
    this._lastHealth = v;
  }

  get lastHealth() {
    return this._lastHealth;
  }

  subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
    if (!this._listening) {
      this._cleanState();
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
}
