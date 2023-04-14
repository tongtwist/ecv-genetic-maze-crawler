export type TGene = 0 | 1 | 2 | 3 


export interface IGenome{
    readonly genes: TGene[]
    readonly length: number
    swap(idx?: number):void
    insert(idx?:number):void
    delete(idx?:number):void
}

// const g = Genome.random(100)
// const g = Genome.from([0,1,2,3])
