import { ILogger } from "./logger.spec";

export class Logger implements ILogger {
    constructor(
        private readonly _prefix : string | undefined,
        private readonly logHeader : string = "-------------------\n",
        private readonly logFooter : string = "\n-------------------"
    ) { 
        Object.freeze(this)
    }

    //readonly prefix: string;
    get prefix() :string {return this._prefix ?? ""};

    _buildMessage(txt:String):string {
        return `\x1b[33m${this._prefix} \x1b[0m${txt} ${this.logFooter}`
    }
    
    begin(){
        return `${this.logHeader}`
    }

    finish(){
        return `${this.logFooter}`
    }

    log(msg: string) {
        console.log(this._buildMessage(msg))
    }
    err(msg: string | Error) {
        const txtMsg = this._buildMessage(
            typeof msg === "string" ? msg : msg.message
        )
        console.log(this._buildMessage(txtMsg))
    }
}
