import { IGenome, TGene } from "./Genome.spec";

export class Genome implements IGenome {
    genes: TGene[];
    length: number;

    constructor(genes: TGene[]) {
        this.genes = genes;
        this.length = genes.length;
    }

    public swap(idx?: number): void {
        if (typeof idx !== "number" || idx < 0 || idx >= this.length) {
            idx = Math.floor(Math.random() * this.length);
        }

        const g = this.genes[idx];
        this.genes[idx] = this.genes[idx + 1];
        this.genes[idx + 1] = g;
    }

    insert(idx?: number): void {

        if (typeof idx !== "number" || idx < 0 || idx >= this.length) {
            idx = Math.floor(Math.random() * this.length)
        }
        this.genes.splice(idx, 0, Math.floor(Math.random() * 4) as TGene);
    }

    delete(idx?: number): void {
        if (typeof idx !== "number" || idx < 0 || idx >= this.length) {
            idx = Math.floor(Math.random() * this.length);
        }
        this.genes.splice(idx, 1);
    }

    random(length: number) {
        this.genes = [];
        for (let i = 0; i < length; i++) {
            this.genes.push(Math.floor(Math.random() * 4) as TGene);
        }
        return new Genome(this.genes);
    }

    from(idx: TGene[]): Genome {
        return new Genome(idx);
    }
}