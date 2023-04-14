import { IGenome, TGene } from "./Genome.spec";

export class Genome implements IGenome {
    readonly length: number; 
    private constructor(
        readonly genes: TGene[], 
        
    ){
        this.length = this.genes.length
    }

    get getGene() : TGene[]{
        return this.genes
    }

    static random (length : number): Genome {
        const gene : TGene[] = []
        for(let i = 0; i< length ; i++){
            gene.push(Math.floor(Math.random() * 3) as TGene) 
        }
        return new Genome(gene )
    }

    static from(gene : TGene[]){
        const newGene = gene
        return new Genome(newGene)
    }

    swap(idx?: number | undefined): void {
        let random= Math.floor(Math.random() * 3) 
        if(idx !== undefined && idx >= 0 && idx < this.length){
            while(random === this.getGene[idx]){
                random = Math.floor(Math.random() * 3) 
            }
            this.getGene[idx] = random as TGene
        }
        this.getGene[Math.floor(Math.random() * this.length)] = Math.floor(Math.random() * 3) as TGene
    }

    insert(idx?: number | undefined): void {
       idx && idx >= 0 && idx < this.length ? 
       this.getGene.splice(idx, 0, Math.floor(Math.random() * 3) as TGene)
       : 
       this.getGene.splice(Math.floor(Math.random() * this.length), 0,  Math.floor(Math.random() * 3) as TGene)

    }
    delete(idx?: number | undefined): void {
        idx && idx >= 0 && idx < this.length ? this.getGene.splice(idx) 
        : 
        this.getGene.splice(Math.floor(Math.random() * this.length)) 
    }

}