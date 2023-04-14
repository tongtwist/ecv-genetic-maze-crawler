import { IGenome, TGene } from './Genome.spec';

export class Genome implements IGenome {
    
    constructor(
        readonly genes: TGene[],
        readonly length: number,
    ) { }
    
    getGenes(): number[] {
        return this.genes;
    }

    swap(idx?: number | undefined): void {
        if (idx !== undefined && idx < this.genes.length - 1) {
        }
    }

    insert(idx?: number | undefined): void {
        if (idx !== undefined && idx <= this.genes.length) {
            this.genes.splice(idx, 0, Math.floor(Math.random() * 3) as TGene);
        }

    }

    delete(idx?: number | undefined): void {
        if (idx !== undefined && idx < this.genes.length) {
            this.genes.splice(idx, 1);
        }
    }

    static random(length: number): Genome {
        const genes: TGene[] = [];
        for (let i = 0; i < length; i++) {
            genes.push(Math.floor(Math.random() * 3) as TGene);
        }
        return new Genome(genes, length);
    }
    static from(genes: TGene[]): Genome {
        const g = Genome.from([0,1,2,3])
        return new Genome(genes, genes.length);
    }
}