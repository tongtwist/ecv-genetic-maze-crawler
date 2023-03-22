import type {TMazeJson, IMaze} from "../Maze.spec"
import type {ICell} from "./Cell.spec"
import {Cell} from "./Cell"

export class Maze implements IMaze {
	private static readonly _di = [0,-1,1,0]
	private static readonly _dj = [-1,0,0,1]

	private readonly _neighborsIdxDistances: [number, number, number, number]
	private readonly _grid: ICell[]
	private _stack: ICell[]
	private _currentCell: ICell
	private _generationFinished: boolean

	constructor(
		private readonly _nbCols: number,
		private readonly _nbRows: number,
		walls?: [boolean, boolean, boolean, boolean][]
	) {
		this._neighborsIdxDistances = [
			this.getIdx(0,-1),
			this.getIdx(-1,0),
			this.getIdx(1,0),
			this.getIdx(0,1)
		]
		this._generationFinished = Array.isArray(walls)
		this._grid = []
		for (let wallIdx = 0, j = 0; j < this._nbRows; j++) {
			for (let i = 0; i < this._nbCols; i++, wallIdx++) {
				const cell = new Cell(
					this, i, j,
					this._generationFinished ? walls![this.getIdx(i,j)] : undefined
				)
				this._grid.push(cell)
			}
		}
		this._stack = []
		this._currentCell = this._grid[0]
	}

	get nbCols(): number { return this._nbCols }
	get nbRows(): number { return this._nbRows }
	get grid(): ICell[] { return this._grid }

	getIdx(i: number, j: number): number {
		return j * this._nbCols + i
	}

	getNeighborsIdxDistance(distIdx: number): number {
		return this._neighborsIdxDistances.indexOf(distIdx)
	}

	private _generateStep(stepCB?: () => void) {
		if (this._generationFinished) {
			return !this._generationFinished
		}
		this._currentCell.setVisited()
		const nextCell = this._currentCell.checkNeighbors()
		if (nextCell) {
			this._currentCell.removeWallWith(nextCell)
			nextCell.removeWallWith(this._currentCell)
			this._stack.push(nextCell)
			this._currentCell = nextCell
		} else if (this._stack.length > 0) {
			this._currentCell = this._stack.pop()!
		}
		this._generationFinished = this._stack.length === 0
		stepCB && stepCB()
		return !this._generationFinished
	}

	generate(sparseRate: number, stepCB?: () => void) {
		while(this._generateStep(stepCB));
		if (sparseRate > 0) {
			this._sparseWalls(sparseRate)
		}
	}

	private _sparseWalls(rate: number) {
		const sparseRate = Math.min(100, Math.max(0, rate)) / 100
		for (let idx = 0; idx < this._grid.length; idx++) {
			if (Math.random() <= sparseRate) {
				this._removeRandomWall(idx)
			}
		}
	}

	private _removeRandomWall(idx: number) {
		const cell = this._grid[idx]
		const removableWalls = []
		for (let sideIdx = 0; sideIdx <= 3; sideIdx++) {
			if (cell.walls[sideIdx]) {
				const neighborI = cell.i + Maze._di[sideIdx]
				const neighborJ = cell.j + Maze._dj[sideIdx]
				if (neighborI >= 0 && neighborI < this._nbCols && neighborJ >= 0 && neighborJ < this._nbRows) {
					removableWalls.push(sideIdx)
				}
			}
		}
		if (removableWalls.length > 0) {
			const randomSideIdx = Math.floor(Math.random() * removableWalls.length)
			const side = removableWalls[randomSideIdx]
			const neighborIdx = cell.idx + this._neighborsIdxDistances[side]
			const neighbor = this._grid[neighborIdx]
			cell.removeWallWith(neighbor)
			neighbor.removeWallWith(cell)
		}
	}

	toJSON(): TMazeJson {
		return {
			c: this._nbCols,
			g: this._grid.map(cell => cell.toJSON())
		}
	}

	static fromJSON(nbCols: number, nbRows: number, json: TMazeJson): IMaze {
		const walls: [boolean, boolean, boolean, boolean][] = json.g.map((flags: number) => Cell.wallsFromJSON(flags))
		return new Maze(nbCols, nbRows)//, walls)
	}
}