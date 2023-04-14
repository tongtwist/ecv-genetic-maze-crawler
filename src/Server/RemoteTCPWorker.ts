import {IRemoteWorker} from "./RemoteWorker.spec";
import { ILogger, THealthMessage, TJSON} from "../Common";
import {AddressInfo, Socket} from "net";
import {BaseRemoteWorker} from "../Common/BaseRemoteWorker";



export class RemoteTCPWorker extends BaseRemoteWorker implements IRemoteWorker {
    private readonly _adr: AddressInfo | {}
    private readonly _remoteWorkerLabel: string;

    constructor(
        protected readonly _logger: ILogger,
        private readonly _socket: Socket
    ) {
        super( _logger );
        this._adr = this._socket.address()
        this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`
    }

    protected _adrToString(): string {
        return "family" in this._adr
            ? `${this._adr.family}://${this._adr.address}:${this._adr.port}`
            : ""
    }

    listen(): void {
        this._socket.on('connect', () => {
            this._connected = true
            this._logger.log(`${this._remoteWorkerLabel} connected`)
        })

        this._socket.on('data', (data: Buffer) => {
            const message = JSON.parse(data.toString())
            this._logger.log(`-> ${JSON.stringify(message.hostname)}`)
            this._logger.log(`-> ${JSON.stringify(message.timestamp)}`)
            this._logger.log(`-> ${JSON.stringify(message.loadAvg)}`)
        })

        this._socket.on('close', () => {
            this._logger.log(`${this._remoteWorkerLabel} connection closed`)
            this._cleanState()
        })

        this._socket.on('error', (err) => {
            this._logger.log(`${this._remoteWorkerLabel} error: ${err.message}`)
            this._cleanState()
        })
    }

    stop(): void {
        this._socket && this._socket.end()
    }

    send(data: TJSON): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const message = JSON.stringify(data)
            this._socket.write(message,'utf8', (err) => {
                if (err) {
                    this._logger.log(`Error sending message: ${err.message}`)
                    resolve(false)
                } else {
                    resolve(true)
                }
            })
        })
    }

}