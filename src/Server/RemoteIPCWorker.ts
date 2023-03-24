import { StopMessage } from './../Common/Message/StopMessage';
import { IBaseMessage } from './../Common/Message/Message.spec';
import { IRemoteWorker } from './RemoteWorker.spec';
import { THealthMessage } from './../Common/Message/HealthMessage.spec';
import {TMessageType, TJSON, messageFromJSON} from "../Common"
import { ILogger } from '../Common/Logger.spec';
import { Worker } from 'node:cluster';
import { Serializable } from 'node:child_process';

export class RemoteIPCWorker implements IRemoteWorker {
    private _listening:boolean = false
    private _messageHandlers: {[k:string]: (data:TJSON) => void} = {}
    private _lastHealth?: IBaseMessage & THealthMessage

    constructor(
        private readonly _logger: ILogger,
        private readonly _worker: Worker
    ){}

    get lastHealth() { return this._lastHealth}

    private _messageHandler(data: TJSON) {
        const retMessage = messageFromJSON(data)
        if (retMessage.isSuccess) {
            const message = retMessage.value!
            if(message.type in this._messageHandlers) {
                this._logger.log(`-> Process ${message.type} message...`)
                this._messageHandlers[message.type](data)
            }
            else {
                this._logger.log(`-> Skip "${message.type}" mesage type`)
            }
         } else {
            this._logger.err(retMessage.error!.message)
        }
    }

    setHealth(v: IBaseMessage & THealthMessage): void {
        this._lastHealth = v
    }

    listen() {
        this._worker.on("message", this._messageHandler.bind(this))
        this._listening = true
        this._logger.log(`Lostening IPC Worker ${this._worker.id}`)
    }

    stop() {
        this._messageHandlers = {}
        this._listening = false
        this._logger.log (`Do not listen IPC Worker ${this._worker.id} anymore`)
        const msg = new StopMessage()
        this._worker.send(msg.toJSON())
    }

    async send(data:TJSON): Promise<boolean> {
        return this._worker.send(data as Serializable)
    }

    subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
        if (!this._listening) {
            return false
        }
        this._messageHandlers[type] = handler
        return true
    }
}