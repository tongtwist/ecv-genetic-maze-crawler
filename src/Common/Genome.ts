import { TGene, IGenome } from './Genome.spec'

export class Genome implements IGenome {
    private constructor(private readonly _genes: TGene[]) {}

    swap(idx?: number): void {
        const index = this.getIndex(idx)
        const previousGene = this.genes[index]
        let newGene = null

        do {
            newGene = Math.floor(Math.random() * 4) as TGene
        } while (newGene === previousGene)

        this.genes[index] = newGene
    }

    insert(idx?: number): void {
        const index = this.getIndex(idx)
        this.genes.splice(index, 0, Math.floor(Math.random() * 4) as TGene)
    }

    delete(idx?: number): void {
        const index = this.getIndex(idx)
        this.genes.splice(index, 1)
    }

    getIndex(idx?: number): number {
        const index =
            typeof idx === 'number'
                ? Math.min(Math.max(idx, 0), this.length - 1)
                : Math.floor(Math.random() * this.length)

        return index
    }

    get length(): number {
        return this._genes.length
    }

    get genes(): TGene[] {
        return [...this._genes]
    }

    static random(length: number): Genome {
        const genes = Array.from(
            { length },
            () => Math.floor(Math.random() * 4) as TGene
        )
        return new Genome(genes)
    }

    // Un array n'est pas passé par valeur mais par référence
    //
    // let a = [0, 1, 2, 3]
    // const g1 = Genome.from(a)
    // a[0] = 3
    // const g2 = Genome.from(a)
    // g1[0] = 3 et non pas 0
    //
    // Solution = [...a] = technique de recopie de tableau

    static from(genes: TGene[]): Genome {
        return new Genome([...genes])
    }
}
