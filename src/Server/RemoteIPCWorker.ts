import { Serializable } from "child_process";
import { IBaseMessage, ILogger, messageFromJSON, StopMessage, THealthMessage, TJSON, TMessageType } from "../Common";
import { IRemoteWorker } from "./RemoteWorker.spec";
import { Worker } from "cluster";
export class RemoteIPCWorker implements IRemoteWorker {
    private _listening: boolean = false
    private _messageHandlers : {[k : string]: (data : TJSON) => void}= {}
    private _lastHealth? : IBaseMessage & THealthMessage

    constructor( private readonly _logger: ILogger, private readonly _worker : Worker){}

    get lastHealth(){
        return this._lastHealth
    }

    private _messageHandler(data : TJSON){
        const retMessage = messageFromJSON(data)
        if(retMessage.isSuccess){
            const message = retMessage.value!
            if(message.type in this._messageHandlers){
                this._logger.log(`-> Process ${message.type} message...`)
                this._messageHandlers[message.type](data)

            }
            else{
                this._logger.log(`-> Skip ${message.type} message type`)
            }
        }
        else {
            this._logger.err(retMessage.error!.message)
        }  
    }

    setHealth(v: IBaseMessage & THealthMessage): void {
        this._lastHealth =v
    }

    listen(): void {
        this._worker.on("message", this._messageHandler.bind(this))
        this._listening = true
        this._logger.log(`Listening IPC Worker ${this._worker.id} anymore`)
    }

    stop(){
        this._messageHandlers = {}
        this._listening = false
        this._logger.log(`Do not listen IPC worker ${this._worker.id}`)
        const msg = new StopMessage()
        this._worker.send(msg.toJSON())

    }

    async send(data: TJSON): Promise<boolean> {
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