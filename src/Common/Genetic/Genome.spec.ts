export interface IGenome {
    readonly genes: TGene[],
    readonly length: number,
    swap(idx?: number): void,
    insert(idx?: number): void,
    delete(idx?: number): void,
}

export type TGene = 0 | 1 | 2 | 3


