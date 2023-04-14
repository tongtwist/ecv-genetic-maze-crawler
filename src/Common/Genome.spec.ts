export type TGene = 0 | 1 | 2 | 3

export interface IGenome {
    readonly genes : TGene[]
    readonly length: number
    swap(idx?: number): void
    insert(idx?: number): void
    delete(idx?: number): void
}

// g = Genome.random(100)
// g = Genome.from([1,0,2,1])