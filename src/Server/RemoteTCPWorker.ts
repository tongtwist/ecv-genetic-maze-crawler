// Besoin d'un Socket
import { Socket, AddressInfo } from 'net'
import {
    TJSON,
    TMessageType,
    IBaseMessage,
    messageFromJSON,
    ILogger,
    THealthMessage,
    StopMessage,
} from '../Common'
import type { IRemoteWorker } from './RemoteWorker.spec'

export class RemoteTCPWorker implements IRemoteWorker {
    private _listening: boolean = false
    private _messageHandlers: { [k: string]: (data: TJSON) => void } = {}
    private _lastHealth?: IBaseMessage & THealthMessage
    private readonly _adr: AddressInfo | {}
    private readonly _remoteWorkerLabel: string

    constructor(readonly _logger: ILogger, private readonly _socket: Socket) {
        this._adr = this._socket.address()
        this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`
    }

    private _adrToString(): string {
        return 'family' in this._adr
            ? `${this._adr.family}:${this._adr.address}:${this._adr.port}`
            : 'unknown'
    }

    get lastHealth() {
        return this._lastHealth
    }

    private _messageHandler(data: TJSON) {
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

    setHealth(v: IBaseMessage & THealthMessage): void {
        this._lastHealth = v
    }

    listen() {
        this._socket.on('data', (data) => {
            try {
                this._messageHandler(JSON.parse(data.toString()))
            } catch (e) {
                return false
            }
        })
        this._listening = true
        this._logger.log(`Listening TCP Worker ${this._remoteWorkerLabel} ...`)
    }

    stop() {
        this._messageHandlers = {}
        this._listening = false
        this._logger.log(
            `Do not listen TCP Worker ${this._remoteWorkerLabel} anymore`
        )
        const msg = new StopMessage()
        this.send(msg.toJSON())
    }

    send(data: TJSON): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this._listening) {
                return false
            }
            this._logger.log(`-> Send message to ${this._remoteWorkerLabel}...`)
            this._socket.write(JSON.stringify(data), 'utf8')
        })
    }

    subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
        if (!this._listening) {
            return false
        }
        this._messageHandlers[type] = handler
        return true
    }
}
