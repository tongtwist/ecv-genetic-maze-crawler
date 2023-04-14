import { BaseRemoteWorker } from './BaseRemoteWorker';
import { Socket, AddressInfo } from "net"
import { TJSON, ILogger, messageFromJSON } from "../Common"
import type { IRemoteWorker } from "./RemoteWorker.spec"

export class RemoteTCPWorker extends BaseRemoteWorker implements IRemoteWorker {
	private readonly _adr: AddressInfo | {}

	constructor(
		readonly _logger: ILogger,
    private readonly _socket: Socket

	) {
        super(_logger)
        this._adr = this._socket.address()
        this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`
    }

  private _adrToString(): string {
        return "family" in this._adr
            ? `${this._adr.family}://${this._adr.address}:${this._adr.port}`
            : ""
  }

  protected _bufferHandler(buf: Buffer): void {
        const data = JSON.parse(buf.toString());
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

  listen() {
		this._socket.on("data", this._bufferHandler.bind(this))
		this._listening = true
		this._logger.log(`Listening TCP Worker ${this._adrToString()} ...`)
	}

async	send(data: TJSON): Promise<boolean> {
		if (!this._socket) {
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
}