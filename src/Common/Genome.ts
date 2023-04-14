import { IGenome, TGene } from "./Genome.spec";

export class Genome implements IGenome {
  public readonly genes: TGene[];
  public readonly length: number;

  constructor(genes: TGene[]) {
    this.genes = genes;
    this.length = genes.length;
  }

  public swap(idx?: number): void {
    const index = idx || Math.floor(Math.random() * this.length);
    this.genes[index] = Math.floor(Math.random() * 4) as TGene;
  }

  public insert(idx?: number): void {
    const index = idx || Math.floor(Math.random() * this.length);
    this.genes.splice(index, 0, Math.floor(Math.random() * 4) as TGene);
  }

  public delete(idx?: number): void {
    const index = idx || Math.floor(Math.random() * this.length);
    this.genes.splice(index, 1);
  }

  public getGenes(): TGene[] {
    return this.genes;
  }

  public static random(length: number): Genome {
    const genes: TGene[] = [];
    for (let i = 0; i < length; i++) {
      genes.push(Math.floor(Math.random() * 4) as TGene);
    }
    return new Genome([...genes]);
  }

  public static from(genes: TGene[]): Genome {
    return new Genome([...genes]);
  }
}
