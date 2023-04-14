import {
	TJSON,
	TMessageType,
	IBaseMessage,
	messageFromJSON,
	ILogger,
	THealthMessage,
	StopMessage
} from "../Common"
import type { IRemoteWorker } from "./RemoteWorker.spec"

export abstract class BaseRemoteWorker implements IRemoteWorker {
    protected _listening: boolean = false;
    protected _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
    protected _lastHealth?: IBaseMessage & THealthMessage;

    constructor(
        protected readonly _logger: ILogger
    ) { }

    get lastHealth() {
        return this._lastHealth;
    }

    setHealth(v: IBaseMessage & THealthMessage): void {
        this._lastHealth = v;
    }

    abstract listen(): void;

    abstract stop(): void;

    abstract send(data: TJSON): Promise<boolean>;

    subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
        if (!this._listening) {
            return false;
        }
        this._messageHandlers[type] = handler;
        return true;
    }
}