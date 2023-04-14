import { TJSON, TMessageType, IBaseMessage, messageFromJSON, ILogger, THealthMessage, StopMessage } from "../Common";
import { BaseWorker } from "./BaseRemoteWorker";
import type { IRemoteWorker } from "./RemoteWorker.spec";
import { AddressInfo, Socket } from "net";

export class RemoteTCPWorker extends BaseWorker implements IRemoteWorker {
    private _adr: AddressInfo | {};

    constructor(protected readonly _logger: ILogger, private readonly _socket: Socket) {
        super(_logger);
        this._adr = this._socket.address();
    }

    listen() {
        this._socket.on("data", (data: Buffer) => {
            const txt = data.toString();
            this._logger.log(`Received ${data.length} bytes from ${this._adr} ("${txt}")`);
            let j: TJSON | undefined;
            try {
                j = JSON.parse(txt);
            } catch (e) {
                this._logger.log(`The received data is not a valid JSON and cannot be processed: ${e}`);
            }
            if (typeof j !== undefined) {
                this._messageHandler(j!);
            }
        });
        this._listening = true;
        this._logger.log(`Listening TCP Worker on ${this._adr}...`);
    }

    stop() {
        this._messageHandlers = {};
        this._listening = false;
        this._logger.log(`Do not listen TCP Worker on ${this._adr} anymore`);
        this.send({ type: StopMessage.type });
        this._socket.end();
    }

    async send(data: TJSON): Promise<boolean> {
        if (!this._socket) {
            return Promise.resolve(false);
        }

        return new Promise((resolve: (v: boolean) => void) => {
            this._socket!.write(JSON.stringify(data), "utf8", (err?: Error) => {
                if (err) {
                    this._logger.log(`Error when emitting data to the server: ${err}`);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }
}
