import type { Walk, IGuy } from "./Guy.spec";

export type Solution = {
    readonly _guy: IGuy,
    readonly _walk: Walk
    readonly _fitness: number
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
    generatePopulation(population: number): void
    nextGeneration(solutionFitness: number): Generation
}