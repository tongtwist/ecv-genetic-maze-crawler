export interface IResult<R> {
	readonly error?: Error
	readonly value?: R
	readonly isSuccess: boolean
	readonly isFailure: boolean
}
