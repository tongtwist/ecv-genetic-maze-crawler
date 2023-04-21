import type {IGenome} from "./Genome.spec"

export type Position = {
	x: number
	y: number
}

export type Walk = {
	steps: number
	wallHits: number
	backtracks: number
	closestDistance: number
	exploration: { [k: number]: number }
}

export interface IGuy {
	readonly age: number
	readonly genome: IGenome
	walk(target: Position): Walk
	mutate(rate: number): void
	vieillis(): void
}

/**
 * const buddy = Guy.create(maze: IMaze)
 * const buddy = Guy.birth(maze: IMaze, mother: IGuy, father: IGuy)
 */