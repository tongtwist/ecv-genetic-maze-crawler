import { TJSON, TMessageType, IBaseMessage, messageFromJSON, ILogger, THealthMessage, StopMessage } from "../Common";
import type { IRemoteWorker } from "./RemoteWorker.spec";
import { AddressInfo, Socket } from "net";

export class RemoteTCPWorker implements IRemoteWorker {
    private _listening: boolean = false;
    private _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
    private _lastHealth?: IBaseMessage & THealthMessage;
    private _adr: AddressInfo | {};

    constructor(private readonly _logger: ILogger, private readonly _socket: Socket) {
        this._adr = this._socket.address();
    }

    get lastHealth() {
        return this._lastHealth;
    }

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
        } else {
            this._logger.err(retMessage.error!.message);
        }
    }

    setHealth(v: IBaseMessage & THealthMessage): void {
        this._lastHealth = v;
    }

    listen() {
        this._socket.on("data", (data: Buffer) => {
            const txt = data.toString();
            this._logger.log(`Received ${data.length} bytes from ${this._host}:${this._port} ("${txt}")`);
            let j: TJSON | undefined;
            try {
                j = JSON.parse(txt);
            } catch (e) {
                this._logger.log(`The received data is not a valid JSON and cannot be processed: ${e}`);
            }
            if (typeof j !== undefined) {
                this._messageHandler(j!);
            }
        });
        this._listening = true;
        this._logger.log(`Listening TCP Worker on ${this._adr}...`);
    }

    stop() {
        this._messageHandlers = {};
        this._listening = false;
        this._logger.log(`Do not listen TCP Worker on ${this._adr} anymore`);
        this.send({ type: StopMessage.type });
		this._socket.end();
    }

    async send(data: TJSON): Promise<boolean> {
        if (!this._socket) {
            return Promise.resolve(false);
        }

        return new Promise((resolve: (v: boolean) => void) => {
            this._socket!.write(JSON.stringify(data), "utf8", (err?: Error) => {
                if (err) {
                    this._logger.log(`Error when emitting data to the server: ${err}`);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
        if (!this._listening) {
            return false;
        }
        this._messageHandlers[type] = handler;
        return true;
    }
}
