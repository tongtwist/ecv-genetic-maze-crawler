import {IRemoteWorker} from "./RemoteWorker.spec";
import {IBaseMessage, ILogger, THealthMessage, TJSON, TMessageType} from "../Common";
import {AddressInfo, Socket} from "net";



export class RemoteTCPWorker implements IRemoteWorker {
    private readonly _adr: AddressInfo | {}
    private readonly _remoteWorkerLabel: string;
    private _connected: boolean = false
    private _messageHandlers: { [k: string]: (data: TJSON) => void } = {}
    private _lastHealth?: THealthMessage | undefined

    constructor(
        private readonly _logger: ILogger,
        private readonly _socket: Socket
    ) {
        this._adr = this._socket.address()
        this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`
    }

    private _cleanState() {
        this._connected = false
        this._messageHandlers = {}
    }

    private _adrToString(): string {
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
            const handler = this._messageHandlers[message.type]
            this._logger.log(`-> ${JSON.stringify(message.hostname)}`)
            if (handler) {
                handler(message.data)
            }
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

    setHealth(v: IBaseMessage & THealthMessage): void {
        this._lastHealth = v
    }


    stop(): void {
        this._socket && this._socket.end()
    }

    subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
        if (!this._connected || !this._socket) {
            this._cleanState()
            return false
        }
        this._messageHandlers[type] = handler
        return true
    }

}