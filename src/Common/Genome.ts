import { IGenome, TGene } from "./Genome.spec";

export class Genome implements IGenome {
  public length!: number;
  public genes!: TGene[];

  private constructor() {
    this.genes = [];
  }

  public static random(length: number): Genome {
    const g = new this();
    g.length = length;

    for (let i = 0; i <= length; i++) {
      g.genes.push(Math.floor(Math.random() * 4) as TGene);
    }

    return g;
  }

  public static from(genes: TGene[]): Genome {
    const g = new this();
    g.genes = genes;
    return g;
  }

  swap(idx: number): void {
    if (typeof idx !== "number" || idx < 0 || idx >= this.length) {
      idx = Math.floor(Math.random() * this.length);
    }

    const g = this.genes[idx];
    this.genes[idx] = this.genes[idx + 1];
    this.genes[idx + 1] = g;
  }

  insert(idx: number): void {
    if (typeof idx !== "number" || idx < 0 || idx >= this.length) {
      idx = Math.floor(Math.random() * this.length);
    }

    this.genes.splice(idx, 0, Math.floor(Math.random() * 4) as TGene);
  }

  delete(idx: number): void {
    if (typeof idx !== "number" || idx < 0 || idx >= this.length) {
      idx = Math.floor(Math.random() * this.length);
    }

    this.genes.splice(idx, 1);
  }
}

const g = Genome.random(20);
