import { Socket, createConnection, AddressInfo } from "net"
import { TJSON, ILogger, messageFromJSON, TMessageType,IBaseMessage, THealthMessage,StopMessage } from "../Common"
import type { IRemoteWorker } from "./RemoteWorker.spec"

export abstract class BaseRemoteWorker {
    protected _listening: boolean = false
    protected _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
    protected _lastHealth?: IBaseMessage & THealthMessage;
    protected _remoteWorkerLabel: string = "Base Remote Worker"

	constructor(
		protected readonly _logger: ILogger
	) {}

    abstract listen(): void
    abstract send(data: TJSON): Promise<boolean>
    
get lastHealth() {
        return this._lastHealth;
  }

setHealth(v: IBaseMessage & THealthMessage): void {
        this._lastHealth = v;
  }

stop() {
    this._messageHandlers = {}
    this._listening = false
    this._logger.log(`Do not listen ${this._remoteWorkerLabel} anymore...`)
    const msg = new StopMessage()
    this.send(msg.toJSON())
}

protected _messageHandler(data: TJSON) {
    const retMessage = messageFromJSON(data)
    if (retMessage.isSuccess) {
        const message = retMessage.value!
        if (message.type in this._messageHandlers) {
            this._logger.log(`-> Process ${message.type} message...`)
            this._messageHandlers[message.type](data)
        } else {
            this._logger.log(`-> Skip "${message.type}" message type`)
        }
    } else {
        this._logger.err(retMessage.error!.message)
    }
}

subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
  if (!this._listening) {
    return false;
  }
  this._messageHandlers[type] = handler;
  return true;
}

}