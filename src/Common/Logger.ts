import {ILogger} from "./Logger.spec";

export default class ShellLogger implements ILogger {
    private static readonly _colorCodes = ["31", "32", "33", "34", "35", "36", "37", "90", "91", "92", "93", "94", "95", "96", "97"];
    protected readonly _logHeader: string = '';
    protected readonly _logFooter: string = '';

    constructor(
        private readonly _prefix?: string,
        colored: boolean = true
    ) {
        this._logHeader = colored ? `\x1b[${ShellLogger._colorCodes[Math.floor(Math.random() * ShellLogger._colorCodes.length)]}m` : '';
        this._logFooter = colored ? `\x1b[0m` : '';
        Object.freeze(this);
    }

    get prefix(): string {
        return this._prefix ?? "";
    }

    log(msg: string): void {
        console.log(`${this._logHeader}${this._prefix} ${msg}${this._logFooter}`);
    }

    error(msg: string | Error): void {
        typeof msg === "string" ? console.error(`${this._prefix} ${msg}`) : console.error(msg);
    }
}