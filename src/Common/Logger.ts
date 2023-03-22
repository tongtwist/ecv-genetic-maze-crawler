import { pid } from "node:process";
import { ILogger } from "./Logger.spec";

export class Logger implements ILogger {
    private static _colorCodes = ["31", "32", "33", "34", "35", "36", "37", "90", "91", "92", "93", "94", "95", "96", "97"]
     protected static _nextColorIndex = (pid * 3) % Logger._colorCodes.length
     protected readonly _logHeader: string
     protected readonly _colorCode?: string
    
    readonly prefix: string;

    constructor(_prefix : string,  colored: boolean = true) {
        this.prefix = _prefix
        
        if (colored) {
            this._colorCode = Logger._colorCodes[Logger._nextColorIndex]
            Logger._nextColorIndex = (Logger._nextColorIndex + 1) % Logger._colorCodes.length
        }
        this._logHeader = this._colorCode ? `\x1b[${this._colorCode}m` : ""
    }
    

    getPrefix() {
        return this.prefix ?? ""
    }

    _buildMessage(txt: string): string {
        return `${this._logHeader} ${this.prefix ? `[${this.prefix}]` : ""} ${txt}\x1b[0m` 
    }
         
    log(msg: string): void {
        console.log(this._buildMessage(msg)); 
    } 
         
    err(msg: string | Error): void { 
        const txtMsg = this._buildMessage(typeof msg === "string" ? msg : msg.message )
        console.error(txtMsg);
    }
    
}