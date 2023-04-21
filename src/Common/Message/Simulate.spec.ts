export type TSimulateMessageType = "simulate"

export type TSimulateMessage = {
	readonly type: TSimulateMessageType
	readonly nbGeneration: number
	readonly growthRate: number
}