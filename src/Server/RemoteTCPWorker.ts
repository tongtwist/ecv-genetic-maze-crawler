import { AddressInfo, Socket } from "net"
import { TJSON, ILogger} from "../Common"
import { IRemoteWorker } from "./RemoteWorker.spec"
import { BaseRemoteWorker } from "./BaseRemoteWorker"

export class RemoteWorker extends BaseRemoteWorker implements IRemoteWorker  {
	
    private readonly _adr: AddressInfo | {} 
    private _remoteWorkerLabel: string 
    
	constructor(
        readonly _logger: ILogger,
        private readonly _socket : Socket
	) {
        super(_logger, `TCP Worker `)
        this._adr = this._socket.address()
        this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`
    }

    private _adrToString() {
        return "adress" in this._adr ? `${this._adr.adress}` : "unknown"
    }

    listen(): void {
        this._logger.log(`Listening TCP Worker ${this._remoteWorkerLabel} ...`)
        this._listening=true
       
        this._socket.on('data', (data) => {
            this._logger.log(`Received : ${data}`  );
            this._messageHandler.bind(this)
        }); 
      
    }

    send(data: TJSON): Promise<boolean> {
        if (!this._listening || !this._socket) {
			
			return Promise.resolve(false)
		}
		return new Promise((resolve: (v: boolean) => void) => {
            
                this._socket.on('error',function(error){
                    console.error(` ${error}`); 
                    return resolve(false)
                });
           
                this._logger.log(`${this._remoteWorkerLabel}: Connected to server on port 8080`);
                const result = this._socket.write(JSON.stringify(data));
                return  resolve(result)
            
           
        }) 
    }

    close() {
		this._socket && this._socket.end()
	}

	
}