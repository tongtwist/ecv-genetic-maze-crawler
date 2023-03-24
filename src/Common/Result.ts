import { IResult } from './Result.spec';
import { EOL } from 'os';


export class Result<R = unknown> implements IResult<R> {
    private readonly _ok: boolean
    private readonly _value?: R
    private readonly _error?: Error

private constructor(value?: R,error?: Error | string) {
    this._ok = typeof error === 'undefined'
    if (this._ok) {
        this._value = value!
    }
    else {
        this._error = typeof error === 'string' ? new Error(error) : error!
    }
    Object.freeze(this)
}

get error(): Error | undefined {return this._error}
get value(): R | undefined {return this._value}
get isSuccess(): boolean {return this._ok}
get isFailure(): boolean {return this._ok}

static success<R = unknown>(value: R): IResult<R> {
    return new Result<R>(value)
}
static failure<R = unknown>(error: string | Error): IResult<R> {
    return new Result<R>(undefined, error)
}
static failureIn<R = unknown>(functionName: string, error: string | Error): IResult<R> {
    return Result.failure<R>(`Error in ${functionName}(),${EOL} -> ${typeof error === "string" ? error : error.message}`)
}
}
