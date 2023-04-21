import {z} from "zod"
import type { IResult } from "../Result.spec"
import { Result } from "../Result"
import type { TJSON, TJSONObject } from "../JSON.spec"
import type { IBaseMessage } from "../Message.spec"
import type { ICell } from "../Maze/Cell.spec"
import type { IMaze } from "../Maze.spec"
import {Maze} from "../Maze"
import type { TMazeMessageType, TMazeMessage, IMazeMessage } from "./Maze.spec"

export class MazeMessage implements IBaseMessage, IMazeMessage {
	static readonly type: TMazeMessageType = "maze"
	static readonly schema = z.object({
		type: z.literal(MazeMessage.type),
		c: z.number().int().positive(),
		g: z.array(z.number().int().nonnegative()),
	})

	constructor(private readonly _maze: IMaze) {
		Object.freeze(this)
	}

	get type() { return MazeMessage.type }
	get c() { return this._maze.nbCols }
	get g() { return this._maze.grid.map((c: ICell) => c.toJSON()) }
	get maze() { return this._maze }

	static parse(j: TJSON): IResult<TMazeMessage> {
		const retZod = MazeMessage.schema.safeParse(j)
		return retZod.success
			? Result.success(j as TMazeMessage)
			: Result.failureIn("MazeMessage.parse", retZod.error)
	}

	toJSON(): TJSONObject {
		const ret = this._maze.toJSON()
		return {...ret, type: MazeMessage.type}
	}

	static fromJSON(j: TJSON): IResult<IBaseMessage & IMazeMessage> {
		const parsingRet = MazeMessage.parse(j)
		if (parsingRet.isSuccess) {
			const {c, g} = parsingRet.value!
			const r = g.length / c
			const maze: IMaze = Maze.fromJSON(c, r, parsingRet.value!)
			return Result.success(new MazeMessage(maze))
		}
		return Result.failureIn("MazeMessage.fromJSON", parsingRet.error!)
	}
}