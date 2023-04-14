import type { IGenome } from './Genome.spec'

export type TPosition = {
    x: number
    y: number
}

export type TWalk = {
    steps: number
    wallHits: number
    backtracks: number
    targetReached: boolean
}

export interface IGuy {
    readonly age: number
    readonly genome: IGenome
    walk(target: TPosition): TWalk
    mutate(rate: number): void
    ages(): void
}

/*
 * const buddy = Guy.create(maze: IMaze)
 * const buddy = Guy.birth(maze: IMaze, mother: IGuy, father: IGuy)
 */
