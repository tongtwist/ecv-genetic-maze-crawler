export type TGene = 0 | 1 | 2 | 3

export interface IGenome {
    readonly genes: TGene[]
    readonly length: number
    swap(idx?: number): void
    insert(idx?: number): void
    delete(idx?: number): void
}

// 0 = haut
// 1 = gauche
// 2 = droite
// 3 = bas