import {IGenome, TGene} from "./Genome.spec"

export class Genome implements IGenome{
    
    genes: TGene;
    length: number;

    constructor(){}
    
    static from(i : TGene) {
        var j = i
        return j;
    }
    static random(oui : number) {
        var array_content : Array<TGene> = []
        var test_array : Array<number> = []
        for (let i = oui; i < test_array.length; i++) {
            test_array.push(Math.floor(Math.random() * 4)) ;
            
        }
        return array_content
    }

    swap(idx?: number | undefined): void {
        throw new Error("Method not implemented.");
    }
    insert(idx?: number | undefined): void {
        throw new Error("Method not implemented.");
    }
    delete(idx?: number | undefined): void {
        throw new Error("Method not implemented.");
    }
    
}
const i = Genome.random(10)
const g = Genome.from(i)