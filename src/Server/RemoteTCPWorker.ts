import { AddressInfo, Socket } from "net"
import { TJSON, TMessageType, ILogger, IBaseMessage, THealthMessage, messageFromJSON} from "../Common"
import { IRemoteWorker } from "./RemoteWorker.spec"

export class RemoteWorker implements IRemoteWorker {
	
    private readonly _adr: AddressInfo | {}
    private _remoteWorkerLabel: string
    private _listening: boolean = false
    private _messageHandlers: { [k: string]: (data: TJSON) => void } = {}
    lastHealth?: THealthMessage | undefined
    private _connected: boolean = false
    
	constructor(
		readonly _logger: ILogger,
        private readonly _socket : Socket
	) {
        this._adr = this._socket.address()
        this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`
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
        this.lastHealth= v
    }

    private _adrToString() {
        return "adress" in this._adr ? `${this._adr.adress}` : "unknown"
    }

    listen(): void {
        this._logger.log(`Listening TCP Worker ${this._remoteWorkerLabel} ...`)
        this._listening=true
        this._socket.on('data', function(this: RemoteWorker, data) {
            this._logger.log(`Received : ${data}`  );
            this._messageHandler.bind(this)
        }); 
      
    }

    stop(): void {
		this._logger.log(`Do not listen TCP Worker ${this._remoteWorkerLabel} anymore`)
        this._socket.on('close',function(this: RemoteWorker){
            this._logger.log(` ${this._remoteWorkerLabel} :Connection Closed`); 
         });
    }

    send(data: TJSON): Promise<boolean> {
        if (!this._connected || !this._socket) {
			
			return Promise.resolve(false)
		}
		return new Promise((resolve: (v: boolean) => void) => {
            this._socket.connect(8080,function(this: RemoteWorker){
                this._socket.on('error',function(error){
                    console.error(` ${error}`); 
                    return resolve(false)
                });
           
                this._logger.log(`${this._remoteWorkerLabel}: Connected to server on port 8080`);
                const result = this._socket.write(JSON.stringify(data));
                return  resolve(result)
            });
           
        }) 
    }

    subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
        if (!this._listening) {
			return false
		}
		this._messageHandlers[type] = handler
		return true
    }

    close() {
		this._socket && this._socket.end()
	}

	
}