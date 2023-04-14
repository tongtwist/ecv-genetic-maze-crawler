import { TJSON, TMessageType, IBaseMessage, messageFromJSON, ILogger, THealthMessage} from "../Common";

export class BaseWorker {
    _listening: boolean = false;
    _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
    _lastHealth?: IBaseMessage & THealthMessage;

    constructor(protected readonly _logger: ILogger) {
    }

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
}
