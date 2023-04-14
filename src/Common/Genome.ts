import {IGenome, TGene} from "./Genome.spec"

export class Genome implements IGenome{
    genes: TGene[];
    length: number;


    constructor(genes: TGene[]) {
        this.genes = genes;
        this.length = length;
    }

    delete(idx: number): void {
        if (typeof idx !== "number" || idx < 0 || idx >= this.length) {
            idx = Math.floor(Math.random() * this.length);
        }

        this.genes.splice(idx,1);
    }

    insert(idx: number): void {
        if (typeof idx !== "number") {
            idx = Math.floor(Math.random() * this.length);
        }
        this.genes.splice(idx, 0, Math.floor(Math.random() * 4) as TGene);
    }

    swap(idx: number): void {
        if (typeof idx !== "number" || idx < 0 || idx >= this.length) {
            idx = Math.floor(Math.random() * this.length);
        }
        const g = this.genes[idx];
        this.genes[idx] = this.genes[idx + 1];
        this.genes[idx + 1] = g;
    }

    public static random(idx: number): Genome{
        const g = new Genome([]);
        for (let i = 0; i < idx; i++) {
            g.genes.push(Math.floor(Math.random() * 4) as TGene)
        }
        return g;
    }

    public static from(idx: TGene[]): Genome{
        return new Genome(idx);
    }
}

// const g = Genome.random(100);
// const g = Genome.from([0,1,2,3]);