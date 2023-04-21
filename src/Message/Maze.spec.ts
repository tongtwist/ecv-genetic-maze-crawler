import type { IMaze, TMazeJson } from "../Common"

export type TMazeMessageType = "maze"

export type TMazeMessage = TMazeJson & {
	readonly type: TMazeMessageType
}

export interface IMazeMessage extends TMazeMessage {
	readonly maze: IMaze
}