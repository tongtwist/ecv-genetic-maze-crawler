import {IGenome, TGene} from './Genome.spec'

export class Genome implements IGenome {
    private constructor( 
        readonly _genes: TGene[],
        readonly _length: number
    ) {}

    swap(idx?: number): void {
        if (idx! < 0 || idx! >= this._length) {
            throw new Error('Invalid index');
        }
        const temp = this._genes[idx!];
        this._genes[idx!] = this._genes[idx! + 1];
        this._genes[idx! + 1] = temp;
    }

    insert(idx?: number): void {    
        if (idx! < 0 || idx! >= this._length) {
            throw new Error("Invalid index");
        }
        this._genes.splice(idx!, 0, 0 as TGene);
    }

    delete(idx?: number): void {
        if (idx! < 0 || idx! >= this._length) {
            throw new Error('Invalid index');
        }
        this._genes.splice(idx!, 1);
    }

    static create(length: number): Genome {
        const genes: TGene[] = [];
        for (let i = 0; i < length; i++) {
            genes.push(Math.floor(Math.random() * 4) as TGene);
        }
        return new Genome(genes, length);
    }

    static from(genes: TGene[]): Genome {    
        return new Genome(genes, genes.length);
    }
}