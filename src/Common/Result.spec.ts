export interface IResult <R> {
    readonly isSuccess: boolean
    readonly isFailure: boolean
    readonly error?: Error
    readonly value?: R
}