import process from "node:process";
import { TJSON, TMessageType, messageFromJSON, ILogger } from "../Common";
import type { IRemoteServer } from "./RemoteServer.spec";

export class RemoteServer implements IRemoteServer {
  private _connected: boolean = false;
  private _messageHandlers: { [k: string]: (data: TJSON) => void } = {};

  constructor(private _logger: ILogger) {}

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

  async connect(): Promise<boolean> {
    process.on("message", this._messageHandler.bind(this));
    this._connected = true;
    this._logger.log("Connected to remote server");
    return this._connected;
  }
  close(): void {
    process.off("message", this._messageHandler.bind(this));
    this._messageHandlers = {};
    this._connected = false;
  }
  async send(data: TJSON): Promise<boolean> {
    return this._connected && !!process.send && process.send(data);
  }
  subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
    if (!this._connected) return false;
    this._messageHandlers[type] = handler;
    return true;
  }
}
