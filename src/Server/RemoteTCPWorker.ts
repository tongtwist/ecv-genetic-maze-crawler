// Besoin d'un Socket
import { Socket, AddressInfo } from 'net'
import { TJSON, ILogger } from '../Common'
import type { IRemoteWorker } from './RemoteWorker.spec'
import { AbstractRemoteWorker } from './AbstractRemoteWorker'

export class RemoteTCPWorker
    extends AbstractRemoteWorker
    implements IRemoteWorker
{
    private readonly _adr: AddressInfo | {}

    constructor(readonly _logger: ILogger, private readonly _socket: Socket) {
        super(_logger)
        this._adr = this._socket.address()
        this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`
    }

    private _adrToString(): string {
        return 'family' in this._adr
            ? `${this._adr.family}:${this._adr.address}:${this._adr.port}`
            : 'unknown'
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

    send(data: TJSON): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this._listening) {
                return false
            }
            this._logger.log(`-> Send message to ${this._remoteWorkerLabel}...`)
            this._socket.write(JSON.stringify(data), 'utf8')
        })
    }
}
