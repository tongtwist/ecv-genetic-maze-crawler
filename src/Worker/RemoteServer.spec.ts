import { TMessageType, TJSON} from "../Common";

export interface IRemoteServer {
    connect(): Promise<boolean>;
    close(): void;
    send(message: TJSON): Promise<TJSON>;
    subscribe(type: TMessageType, callback: (message: TJSON) => void): boolean;
}