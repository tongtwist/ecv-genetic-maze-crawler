import {ILogger} from "./Logger.spec";

export abstract class ShellLogger implements ILogger {
    protected constructor(readonly _prefix?: string) {
        Object.freeze(this);
    }

    get prefix(): string {
        return this._prefix ?? "";
    }

    log(msg: string): void {
        console.log(`${this._prefix} ${msg}`);
    }

    error(msg: string | Error): void {
        console.error(`${this._prefix} ${msg}`);
    }
}