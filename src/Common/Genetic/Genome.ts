import { IGenome, TGene } from "./Genome.spec";

export class Genome implements IGenome {
  private _genes: TGene[];
  private _length: number;

  constructor(genes: TGene[]) {
    this._genes = genes;
    this._length = genes.length;
  }

  get genes(): TGene[] {
    return [...this._genes];
  }

  get length(): number {
    return this._length;
  }

  static random(length: number): Genome {
    const g = new Genome([]);
    for (let i = 0; i < length; i++) {
      g._genes.push(Math.floor(Math.random() * 4) as TGene);
    }
    return g;
  }

  static from(genes: TGene[]): Genome {
    return new Genome([...genes]);
  }

  public swap(idx: number): void {
    if (typeof idx !== "number" || idx < 0 || idx >= this._length) {
      idx = Math.floor(Math.random() * this._length);
    }

    const g = this._genes[idx];
    this._genes[idx] = this._genes[idx + 1];
    this._genes[idx + 1] = g;
  }

  public insert(idx: number): void {
    if (typeof idx !== "number" || idx < 0 || idx >= this._length) {
      idx = Math.floor(Math.random() * this._length);
    }

    this._genes.splice(idx, 0, Math.floor(Math.random() * 4) as TGene);
  }

  public delete(idx: number): void {
    if (typeof idx !== "number" || idx < 0 || idx >= this._length) {
      idx = Math.floor(Math.random() * this._length);
    }

    this._genes.splice(idx, 1);
  }
}
