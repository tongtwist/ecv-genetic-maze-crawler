import {ILogger} from "./Logger.spec";

export abstract class Logger implements ILogger {
    readonly prefix: string;
    protected constructor(prefix: string) {
        this.prefix = prefix;
    }

    log(msg: string): void {
        console.log(`${this.prefix} ${msg}`);
    }

    error(msg: string | Error): void {
        console.error(`${this.prefix} ${msg}`);
    }
}