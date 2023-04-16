import type {Walk, IGuy} from "./Guy.spec"

export type Solution = {
	readonly guy: IGuy
	readonly walk: Walk
	readonly fitness: number
}

export type Generation = {
	readonly population: number
	readonly solutions: Solution[]
	readonly generation: number
	readonly minAge: number
	readonly maxAge: number
	readonly avgAge: number
	readonly minFitness: number
	readonly maxFitness: number
	readonly avgFitness: number
}

export interface IWorld {
	generatePopulation(nbGuys: number): void
	nextGeneration(solutionFitness: number): Generation
}