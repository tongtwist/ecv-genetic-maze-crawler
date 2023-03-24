import { pid } from 'node:process'
import { ILogger } from './Logger.spec'

export class ShellLogger implements ILogger {
    protected static readonly _colorCodes = [
        '31',
        '32',
        '33',
        '34',
        '35',
        '36',
        '37',
        '91',
        '92',
        '93',
        '94',
        '95',
        '96',
        '97',
    ]
    protected static _nextColorIndex =
        (pid * 3) % ShellLogger._colorCodes.length
    protected readonly _logHeader: string
    protected readonly _colorCode?: string

    public constructor(
        private readonly _prefix?: string,
        colored: boolean = true
    ){
        if(colored) {
            this._colorCode =
                ShellLogger._colorCodes[ShellLogger._nextColorIndex]
        }
        const _logPrefix = _prefix?.trim()
        this._logHeader = `${colored ? `\x1b[${this._colorCode}m` : ''}${
            _logPrefix === '' ? '' : `[${_logPrefix}]`
        }`

        Object.freeze(this)
        }
    get prefix() { return this._prefix ?? ""}

    _buildMessage(txt: string): string {
        return `${this.prefix} ${txt}`
    }
    log(msg: string) {
        console.log(this._buildMessage(msg));
    }
    err(msg: string | Error): void {
        const txtMsg = this._buildMessage( 
            typeof msg === "string" ? msg : msg.message
        )
        console.error(txtMsg);
    }
}
