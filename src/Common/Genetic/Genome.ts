import { TGene, IGenome } from "./Genome.spec";

export class Genome implements IGenome {    
    private constructor(genes: TGene[]) {}

    public static from(genes: TGene[]) {
        return new Genome([...genes])
    }

    public static random(length: number) {
        const genes: TGene[] = []
        for (let i = 0; i < length; i++) {
            genes.push(Math.floor(Math.random() * 4) as TGene)
        }
        return new Genome([...genes])
    }

    private static _getRandomIndex(length: number) {
        return Math.floor(Math.random() * length)
    }

    private static _verifyIndex(idx?: number) {
        if(idx && idx >= 0 && idx < this.length) {
            return idx
        }
        return Genome._getRandomIndex(this.length)
    }   

    private static _getRandomGene() {
        return Math.floor(Math.random() * 4) as TGene
    }

    get length() {
        return this.genes.length
    }

    get genes(): TGene[] {
        return [...this.genes] 
    }

    swap(idx?: number) {
        const i = Genome._verifyIndex(idx)
        this.genes[i] = Genome._getRandomGene()
    }

    insert(idx?: number) {
        const i = Genome._verifyIndex(idx)
        const gene = this.genes[i]
        this.genes.splice(i, 0, gene)
    }

    delete(idx?: number) {
        const i = Genome._verifyIndex(idx)
        this.genes.splice(i, 1)
    }
}