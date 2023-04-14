import { createServer, Socket } from "node:net";
import {
  TJSON,
  TMessageType,
  IBaseMessage,
  messageFromJSON,
  ILogger,
  THealthMessage,
  StopMessage,
} from "../Common";
import type { IRemoteWorker } from "./RemoteWorker.spec";

export class RemoteTCPWorker implements IRemoteWorker {
  private _listening: boolean = false;
  private _messageHandlers: { [k: string]: (data: TJSON) => void } = {};
  private _lastHealth?: IBaseMessage & THealthMessage;

  private _socket?: Socket;

  constructor(
    private readonly _logger: ILogger,
    private readonly _port: number
  ) {}

  get lastHealth() {
    return this._lastHealth;
  }

  private _messageHandler(data: TJSON): void {
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

  listen(): void {
    const server = createServer((socket) => {
      this._socket = socket;

      socket.on("data", (data) => {
        try {
          const jsonData = JSON.parse(data.toString());
          this._messageHandler(jsonData);
        } catch (err) {
          this._logger.err("Problem when received data");
        }
      });

      socket.write("Hello from TCP Worker");

      socket.on("close", () => {
        this._logger.log(`TCP Worker is now disconnected`);
      });
    });

    server.listen(this._port, () => {
      this._listening = true;
      this._logger.log(`Listening TCP Worker on port ${this._port}`);
    });
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

  async send(data: TJSON): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this._socket || !this._listening) {
        resolve(false);
      } else {
        this._socket.write(JSON.stringify(data), (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      }
    });
  }

  subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean {
    if (!this._listening) {
      return false;
    }

    this._messageHandlers[type] = handler;
    return true;
  }
}
