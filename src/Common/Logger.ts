import { ILogger } from "./Logger.spec";

export class Logger implements ILogger {
    
    readonly prefix: string;

    constructor(_prefix : string) {
        this.prefix = _prefix
    }

    getPrefix() {
        return this.prefix
    }

    public log(msg: string): void {
        console.log(this.getPrefix() ,": " , msg)
    }

    public err(msg: string | Error): void {
       if(typeof msg === "string"){
        console.error(this.getPrefix() ,": " ,msg)
       }
       else{
        console.error(this.getPrefix(), ": error name:" , msg.name);
        console.error(this.getPrefix() ,": error message:" , msg.message);
       }
    }
    
}