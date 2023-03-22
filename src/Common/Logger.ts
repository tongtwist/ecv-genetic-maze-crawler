
import { pid } from "node:process"

export interface ILogger{
    readonly prefix: string
        log(msg: string):void;
        err(msg: string | Error):void
}


export class ShellLogger implements ILogger {
    protected readonly _colorCode?:string
    private static _colorCodes = ["31", "32", "33", "34", "35", "36", "37", "90", "91", "92", "93", "94", "95", "96", "97"]
    protected static _nextColorIndex = (pid * 3) % ShellLogger._colorCodes.length
    protected readonly _logHeader: string

    constructor (
        readonly _prefix?: string,
        colored: boolean = true
    ){
        if(colored){
            this._colorCode = ShellLogger._colorCodes[ShellLogger._nextColorIndex]
            ShellLogger._nextColorIndex = (ShellLogger._nextColorIndex + 1) % ShellLogger._colorCodes.length
        }
        // const _logPrefix = this.prefix.trim()
        this._logHeader = this._colorCode ? `\x1b[${this._colorCode}m` : ""        
        Object.freeze(this)
    }
    
    get prefix() { return this._prefix ?? "" }
    
    _buildMessage(txt: string): string{ 
        return `${this._logHeader}${this._prefix ? `[${this._prefix}]` : ""} ${txt}\x1b[0m`
    }

    log(msg: string):void{
        console.log(this._buildMessage(msg))
    }
    err(msg:string | Error):void{
        const txtMsg = this._buildMessage(
            typeof msg === "string" ? msg : msg.message
            )
            console.error(txtMsg)
        }
        
}
 


// class Timestamp 