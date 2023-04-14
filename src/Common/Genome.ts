import {IGenome, TGene} from "./Genome.spec";

export class Genome implements IGenome {
    genes: TGene[];
    length: number;

    constructor(genes: TGene[]) {
        this.genes = genes;
        this.length = genes.length;
    }
    
    public getGenes(): TGene[] {
        return this.genes;
    }

    public delete(idx?: number): void {
        const index = idx || Math.floor(Math.random() * this.length);
        this.genes.splice(index, 1);
    }


    public insert(idx?: number): void {
        const index = idx || Math.floor(Math.random() * this.length);
        this.genes.splice(index, 0, Math.floor(Math.random() * 4) as TGene);
    }

    public swap(idx?: number): void {
        const index = idx || Math.floor(Math.random() * this.length);
        this.genes[index] = Math.floor(Math.random() * 4) as TGene;
    }

    random(length: number){
        this.genes = [];
        for (let i = 0; i < length; i++) {
            this.genes.push(Math.floor(Math.random() * 4) as TGene);
        }
        return new Genome(this.genes);
    }

    from(genes: TGene[]): Genome{
        return new Genome([...genes]);
    }
}
