import { Socket, createConnection, AddressInfo } from "net"
import { TJSON, ILogger, messageFromJSON, TMessageType,IBaseMessage, THealthMessage,StopMessage } from "../Common"
import type { IRemoteWorker } from "./RemoteWorker.spec"

export class RemoteTCPWorker implements IRemoteWorker {
	private readonly _adr: AddressInfo | {}
    private _connected: boolean = false
    private _listening: boolean = false
    private _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
    private _lastHealth?: IBaseMessage & THealthMessage;

	constructor(
		private readonly _logger: ILogger,
		private readonly _host: string,
        private readonly _remoteWorkerLabel: string,
		private readonly _port: number,
        private readonly _socket: Socket

	) {
        this._adr = this._socket.address()
        this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`
    }

    private _adrToString(): string {
        return "family" in this._adr
            ? `${this._adr.family}://${this._adr.address}:${this._adr.port}`
            : ""
    }

      get lastHealth() {
        return this._lastHealth;
      }

    private _bufferHandler(data: TJSON): void {
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

      setHealth(v: IBaseMessage & THealthMessage): void {
        this._lastHealth = v;
      }

    listen() {
		this._socket.on("message", this._bufferHandler.bind(this))
		this._listening = true
		this._logger.log(`Listening TCP Worker ${this._adrToString()} ...`)
	}

    stop(): void {
        this._messageHandlers = {};
        this._listening = false;
        this._logger.log(`Stop to listen TCP Worker`);
        const msg = new StopMessage();
        this.send(msg.toJSON());
    
        if (this._socket) {
          this._socket.end();
        }
    }

	send(data: TJSON): Promise<boolean> {
		if (!this._connected || !this._socket) {
			return Promise.resolve(false)
		}
		return new Promise((resolve: (v: boolean) => void) => {
			this._socket!.write(JSON.stringify(data), "utf8", (err?: Error) => {
				if (err) {
					this._logger.log(`Error when emitting data to the server: ${err}`)
					resolve(false)
				} else {
					resolve(true)
				}
			})
		})
	}

    subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
        if (!this._listening) {
          return false;
        }
    
        this._messageHandlers[type] = handler;
        return true;
    }

}