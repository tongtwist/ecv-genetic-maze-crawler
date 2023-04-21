import type { IMaze } from "../Maze.spec"
import type { TMazeJson } from "../Maze.spec"

export type TMazeMessageType = "maze"

export type TMazeMessage = TMazeJson & {
	readonly type: TMazeMessageType
}

export interface IMazeMessage extends TMazeMessage {
	readonly maze: IMaze
}