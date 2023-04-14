export type TGene = 0 | 1 | 2 | 3

export interface IGenome {
    readonly _genes: TGene[]
    readonly _length: number
    swap(idx?: number): void
    insert(idx?: number): void
    delete(idx?: number): void
}

    /*
    const g = Genome.create(100)
    const g = Genome.from([0,3,1,0,...])
    */