import { EOL, type } from "os";
import { ErrorMapCtx } from "zod";
import { IResult } from "./Result.spec";

export class Result<R = unknown> implements IResult<R> {
    
   
    private readonly _error? : Error
    private readonly _value? : R
    private readonly _ok : boolean

    private constructor(value? : R, error ?: Error | string ){
        this._ok = typeof error === "undefined"
        if(this._ok){
            this._value = value!
        }

        else {
            this._error = typeof error === "string" ? new Error(error) : error!
        }

    }
    get error() : Error | undefined{ return this._error}
    get value(){
        return this._value
    }

    get isSuccess(){
        return this._ok
    }

    get isFailure(){
        return !this._ok
    }

    static success<R = unknown>(value :R){
        return new Result<R>(value)
    }

    static failure<R = unknown>(error : string | Error){
        return new Result<R>(undefined, error)
    }

    static failureIn<R = unknown>(functionName : string , error : string | Error) {
        return Result.failure(`Error in ${functionName}(), ${EOL} -> ${typeof error === "string" ? error : error.message} `)   
    }
}