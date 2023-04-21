import type {Walk} from "./Guy.spec"

export type Solution = {
	readonly guyID: number
	readonly walk: Walk
	readonly fitness: number
}

export type Generation = {
	population: number
	generation: number
	minAge: number
	maxAge: number
	avgAge: number
	minFitness: number
	maxFitness: number
	avgFitness: number
	readonly solutions: Solution[]
	readonly explorations: {[k: number]: number}
}

export interface IWorld {
	generatePopulation(nbGuys: number): void
	evaluatePopulation(solutionFitness: number): Generation
	nextGeneration(solutionFitness: number): Generation
}