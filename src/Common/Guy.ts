import type { IGenome } from "./Genome.spec"
import {Genome} from "./Genome"
import type {IMaze} from "./Maze.spec"
import type {Position, Walk, IGuy} from "./Guy.spec"

export class Guy implements IGuy {
	private static readonly _moves: {dim: keyof Position, delta: number}[] = [
		{dim: "y", delta: -1},
		{dim: "x", delta: -1},
		{dim: "x", delta: 1},
		{dim: "y", delta: 1},
	]
	static create(maze: IMaze): IGuy {
		return new Guy(maze)
	}
	static birth(maze: IMaze, mother: IGuy, father: IGuy): IGuy {
		return new Guy(maze, Genome.crossOver(mother.genome, father.genome))
	}

	private _age = 0
	private readonly _genome: IGenome

	private constructor (
		private readonly _maze: IMaze,
		readonly givenGenome?: IGenome,
	) {
		const nbGenes = Math.max(
			this._maze.nbCols + this._maze.nbRows,
			this._maze.nbCols * this._maze.nbRows * 0.5,
		)
		this._genome = givenGenome ?? Genome.create(nbGenes)
	}

	get age(): number { return this._age }
	get genome(): IGenome { return this._genome }

	private _step(position: Position, gene: number): [Position, boolean] {
		const walls = this._maze.grid[this._maze.getIdx(position.x, position.y)].walls
		const newPosition = {...position}
		const wallHit = walls[gene]
		if (!wallHit) {
			const move = Guy._moves[gene]
			newPosition[move.dim] += move.delta
		}
		return [newPosition, wallHit]
	}

	walk(target: Position): Walk {
		const targetIdx = this._maze.getIdx(target.x, target.y)
		const steps = this._genome.length
		let wallHits = 0
		let backtracks = 0
		let closestDistance = target.x + target.y;
		let position: Position = {x: 0, y: 0}
		let idx = this._maze.getIdx(position.x, position.y)
		const exploration: {[k: number]: number} = {}
		exploration[idx] = 1
		let i = 0
		for (; i < steps && closestDistance > 0; i++) {
			const gene = this._genome.genes[i]
			const [newPosition, wallHit] = this._step(position, gene)
			if (wallHit) {
				wallHits++
			} else {
				position = newPosition
			}
			idx = this._maze.getIdx(position.x, position.y)
			const distance = Math.abs(position.x - target.x) + Math.abs(position.y - target.y)
			closestDistance = Math.min(distance, closestDistance)
			if (idx in exploration) {
				backtracks++
			} else {
				exploration[idx] = 0
			}
			if (closestDistance > 0) {
				exploration[idx]++
			}
		}
		return {steps: i + 1, wallHits, backtracks, closestDistance, exploration}
	}

	mutate(givenRate: number): void {
		const rate = Math.max(0, Math.min(1, givenRate))
		let hasard = Math.random()
		if (hasard <= rate) {
			hasard = hasard / rate
			if (hasard <= 0.33) {
				this._genome.swap()
			} else if (hasard <= 0.67) {
				this._genome.insert()
			} else {
				this._genome.delete()
			}
		}
	}

	vieillis(): void {
		this._age++
	}
}