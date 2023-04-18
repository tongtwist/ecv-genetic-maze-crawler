import { IGenome, TGene } from "./Genome.spec";

export class Genome implements IGenome {
  genes: TGene[];
  length: number;

  constructor(genes: TGene[]) {
    this.genes = genes;
    this.length = genes.length;
  }

  static random(length: number) {
    const genes: TGene[] = [];
    for (let i = 0; i < length; i++) {
      genes.push(<TGene>Math.floor(Math.random() * 4));
    }
    return new Genome([...genes]);
  }

  getGenes(): TGene[] {
    return this.genes;
  }

  swap(idx?: number): void {
    const index = idx || Math.floor(Math.random() * this.length);
    this.genes[index] = <TGene>Math.floor(Math.random() * 4);
  }

  insert(idx?: number): void {
    const index = idx || Math.floor(Math.random() * this.length);
    this.genes.splice(index, 0, <TGene>Math.floor(Math.random() * 4));
  }

  delete(idx?: number): void {
    const index = idx || Math.floor(Math.random() * this.length);
    this.genes.splice(index, 1);
  }

  random(length: number) {
    this.genes = [];
    for (let i = 0; i < length; i++) {
      this.genes.push(<TGene>Math.floor(Math.random() * 4));
    }
    return new Genome(this.genes);
  }

  from(genes: TGene[]): Genome {
    return new Genome([...genes]);
  }
}