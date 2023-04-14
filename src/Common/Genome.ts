import { TGene, IGenome } from "./Genome.spec"

export class Genome implements IGenome {
    constructor(
        public readonly genes: TGene[] = [],
    ) {}

    static random(length: number): Genome {
        const genes: TGene[] = []
        for (let i = 0; i < length; i++) {
            genes.push(Math.floor(Math.random() * 4) as TGene)
        }
        return new Genome(genes)
    }

    static from(genes: TGene[]): Genome {
        return new Genome(genes)
    }

    get length(): number {
        return this.genes.length
    }

    swap(idx?: number): void {
        if (!idx) {
          idx = Math.floor(Math.random() * this.genes.length);
        }
        const idx2 = Math.floor(Math.random() * this.genes.length);
        [this.genes[idx], this.genes[idx2]] = [this.genes[idx2], this.genes[idx]];
      }
    
      insert(idx?: number): void {
        if (!idx) {
          idx = Math.floor(Math.random() * (this.genes.length + 1));
        }
        this.genes.splice(idx, 0, Math.floor(Math.random() * 4) as TGene);
      }
    
      delete(idx?: number): void {
        if (!idx) {
          idx = Math.floor(Math.random() * this.genes.length);
        }
        this.genes.splice(idx, 1);
      }

}