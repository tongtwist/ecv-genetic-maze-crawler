import {IBaseMessage, THealthMessage, TMessageType} from "./Message.spec";
import {TJSON} from "./JSON.spec";
import {ILogger} from "./Logger.spec";

export abstract class BaseRemoteWorker{
    protected _lastHealth?: IBaseMessage & THealthMessage
    protected _connected: boolean = false
    protected _messageHandlers: { [k: string]: (data: TJSON) => void } = {}
    protected _listening: boolean = false
    constructor(
        protected readonly _logger: ILogger,
    ) {
    }

    protected _cleanState() {
        this._connected = false
        this._messageHandlers = {}
    }

    setHealth(v: IBaseMessage & THealthMessage): void {
        this._lastHealth = v
    }

    subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
        if (!this._listening) {
            this._cleanState()
            return false
        }
        this._messageHandlers[type] = handler
        return true
    }

}