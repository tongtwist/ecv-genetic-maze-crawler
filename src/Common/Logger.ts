import { pid } from "node:process"

export interface ILogger {
    readonly prefix: string
    log(msg: string): void
    err(msg: string | Error): void
}

export class ShellLogger implements ILogger {
    private static readonly _colorCodes = ["31", "32", "33", "34", "35", "36", "37", "90", "91", "92", "93", "94", "95", "96"]
    protected static _nextColorIndex = (pid * 3) % ShellLogger._colorCodes.length
    protected readonly _logHeader: string
    protected readonly _colorCode?: string

    constructor (
        private readonly _prefix?: string,
        colored: boolean = true
    ) {
        if (colored) {
			this._colorCode = ShellLogger._colorCodes[ShellLogger._getColorIndex()]
		}
        this._logHeader = `${colored ? `\x1b[${this._colorCode}m` : ""}${typeof _prefix === "undefined" ? "" : `${_prefix.trim()} `}`
        Object.freeze(this)
    }

    get prefix() { return this._prefix ?? "" }

    _buildMessage(txt: string): string {
        return `${this.prefix} ${txt}`
    }
    
    log(msg: string) {
        console.log(this._buildMessage(msg))
    }

    err(msg: string | Error) {
        const txtMsg = this._buildMessage(
            typeof msg === "string" ? msg : msg.message
        )
        console.error(txtMsg)
    }

    private static _getColorIndex(): number {
		const ret = ShellLogger._nextColorIndex
		ShellLogger._nextColorIndex = (ShellLogger._nextColorIndex + 1) % ShellLogger._colorCodes.length
		return ret
	}
}
