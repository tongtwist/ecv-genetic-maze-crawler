export interface IResult<R> {
    readonly error?: Error;
    readonly value?: R;
    readonly IsSuccess: boolean;
    readonly IsFailure: boolean;
}