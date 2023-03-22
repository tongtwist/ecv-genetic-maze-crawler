import {IRemoteServer} from "./RemoteServer.spec";
import {ILogger, messageFromJSON, TJSON, TMessageType} from "../Common";

export class RemoteServer implements IRemoteServer{
    private _connected: boolean = false;
    private _messageHandlers: { [k: string]: (data: TJSON) => void } = {};

    constructor(
        private readonly _logger: ILogger,
    ) {}

    private _messageHandler = (data: TJSON) => {
        const retMessage = messageFromJSON(data);
        if (retMessage.IsSuccess) {
            const message = retMessage.value!;
            if (message.type in this._messageHandlers) {
                this._logger.log(`-> process ${message.type} message ...`);
                this._messageHandlers[message.type](data);
            } else {
                this._logger.log(`-> skip ${message.type} message type ...`);
            }
        } else {
            this._logger.error(`-> skip invalid message type ..`);
        }
    }

    async connect(): Promise<boolean> {
        process.on('message', this._messageHandler.bind(this));
        this._connected = true;
        this._logger.log('Connected to remote server');
        return this._connected;
    }

    close(): void {
        process.off('message', this._messageHandler.bind(this));
        this._messageHandlers = {};
        this._connected = false;
    }

    async send(data: TJSON): Promise<TJSON> {
        return this._connected && !!process.send && process.send(data);
    }

    subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
        if (!this._connected) {
            return false;
        }
        this._messageHandlers[type] = handler;
        return true;
    }
}