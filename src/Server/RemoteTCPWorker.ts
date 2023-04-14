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
import {Socket} from "net";
import { BaseRemoteWorker } from "./BaseRemoteWorker"

export class RemoteTCPWorker extends BaseRemoteWorker implements IRemoteWorker  {

    constructor(
        readonly _logger: ILogger,
        private readonly _socket: Socket
    ) {
        super(_logger);
    }

    listen() {
        this._socket.on("message", this._messageHandler.bind(this))
        this._listening = true
        this._logger.log(`Listening TCP Worker ...`)
    }

    async send(data: TJSON): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._socket.write(JSON.stringify(data), (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(true)
                }
            })
        })
    }
}