import { IGenome, TGene } from "./Genome.spec";

export class Genome implements IGenome {
    private constructor(
        private readonly _genes: TGene[],
        private readonly _length: number
    ) { }

    get genes(): TGene[] {
        return this._genes;
    }

    get length(): number {
        return this._length;
    }

    getGenomeLength(): number {
        return this._genes.length;
    }

    swap(idx?: number): void {
        if (typeof(idx) === "number") {
            this.delete(idx);
            this.insert(idx - 1);
        } else {
            const idx = this.randomByLength();
            this.delete(idx);
            this.insert(idx - 1);
        }
    }

    insert(idx?: number): void {
        typeof (idx) === "number"
            ? this._genes[idx] = Genome.randomGene()
            : this._genes[this.randomByLength()] = Genome.randomGene();
    }

    delete(idx?: number): void {
        typeof (idx) === "number" ?
        this._genes.splice(idx, 1) 
        : this._genes.splice(this.randomByLength(), 1);
    }

    static from(genes: TGene[]): Genome {
        return new Genome(genes, genes.length);
    }

    static random(length: number): Genome {
        const genes: TGene[] = [];
        for (let i = 0; i < length; i++) {
            genes.push(Genome.randomGene());
        }
        return new Genome(genes, length);
    }

    static randomGene(): TGene {
        return Math.floor(Math.random() * 4) as TGene;
    }

    randomByLength(): number {
        const length = this.getGenomeLength();
        return Math.floor(Math.random() * length);
    }
}