export type TGene = 0 | 1 | 2 | 3

export interface IGenome {
    readonly genes: TGene[]
    readonly length: number
    swap(idx?: number): void
    insert(idx?: number): void
    delete(idx?: number): void
}

/*
* const g = Genome.random(100)
* const g = Genome.from([0, 3, 1, 2, ...])
*/

export class Genome implements IGenome {
    readonly genes: TGene[]
    readonly length: number

    constructor(genes: TGene[]) {
        this.genes = genes
        this.length = genes.length
    }


    static random(length: number): IGenome {

        const gene : TGene[] = []
        for(let i = 0; i < length; i++) {
            gene.push(Math.floor(Math.random() * 4) as TGene)
        }
        // const genes = Array.from({ length }, () => Math.floor(Math.random() * 4) as TGene)
        // return new Genome(genes)
        return new Genome(gene)
    }

    static from(gene: TGene[]): IGenome {
        const newGene = [...gene]
        return new Genome(newGene)
    }

    swap(idx?: number | undefined): void {
        let random = Math.floor(Math.random() * 4)
        const i = idx || Math.floor(Math.random() * this.length)
        this.genes[i] = random as TGene
    }

    insert(idx?: number | undefined): void {
        const i = idx || Math.floor(Math.random() * this.length)
        this.genes.splice(i)
    }

    delete(idx?: number | undefined): void {
        const i = idx || Math.floor(Math.random() * this.length)
        this.genes.splice(i)
    }
}