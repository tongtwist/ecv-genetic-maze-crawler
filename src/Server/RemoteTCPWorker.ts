import net from "net";
import {
    TJSON,
    TMessageType,
    IBaseMessage,
    messageFromJSON,
    ILogger,
    THealthMessage,
    StopMessage,
} from "../Common";
import type { IRemoteWorker } from "./RemoteWorker.spec";
import { Socket } from 'node:net';
import { BaseRemoteWorker } from "./BaseRemoteWorker";

export class RemoteTCPWorker extends BaseRemoteWorker implements IRemoteWorker {
    protected _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
    
    constructor(
        readonly _logger: ILogger,
        private readonly _socket: net.Socket
    ) {
        super(_logger);
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

    listen() {
        this._socket.on("data", (data: Buffer) => {
            this._messageHandler(data.toString());
        });
        this._listening = true;
        this._logger.log(`Listening TCP Worker ${this._socket.remoteAddress}:${this._socket.remotePort}...`);
        this._socket.on("error", (err: Error) => {
            this._logger.err(err.message);
        });
    }

    stop() {
        this._messageHandlers = {};
        this._listening = false;
        this._logger.log(
            `Do not listen TCP Worker ${this._socket.remoteAddress}:${this._socket.remotePort} anymore`
        );
        const msg = new StopMessage();
        this.send(msg.toJSON()).catch((err) => {
            this._logger.err(err.message);
        });
        this._socket?.destroy();
    }

    async send(data: TJSON): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (!this._socket?.writable) {
                reject(new Error("Socket is not writable"));
                return;
            }
            this._socket.write(JSON.stringify(data), (err) => {
                if (err) {
                    this._logger.err(err.message);
                    reject(err);
                    return;
                }
                resolve(true);
            });
        });
    }
}
