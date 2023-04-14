import type { IGenome } from "./Genome.spec"

export type Position = {
    x: number,
    y: number
}

export type Walk = {
    steps: number,
    wallHits: number,
    backtracks: number,
    targetReached: boolean
}

export interface IGuy {
    readonly _age: number,
    readonly _genome: IGenome,
    walk(target: Position): Walk
    mutate(rate: number): void
    vieillis(): void
}