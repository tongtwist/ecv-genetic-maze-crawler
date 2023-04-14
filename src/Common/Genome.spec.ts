// Haut, Gauche, Droite, Bas
export type TGene = 0 | 1 | 2 | 3

export interface IGenome {
    readonly genes: TGene[]
    readonly length: number

    // idx = indexe du gene dans le genome

    swap(idx?: number): void
    insert(idx?: number): void
    delete(idx?: number): void
}

/*
 * Create a genome with 100 genes
 * const g = Genome.create(100)
 * const g = Genome.from([0, 3, 1, 2,...])
 */
