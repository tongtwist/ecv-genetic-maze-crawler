import {IGenome TGene } from './Genome.spec';
import {IGuy} from './Guy.spec';
import {Genome} from './Genome';

export class Guy implements IGuy{
    constructor(
        public _age: number,
        public readonly _genome: IGenome
    ) {}

    walk(target: Position): Walk{
        return {
            steps: 0,
            wallHits: 0,
            backtracks: 0,
            targetReached: false
          };
    }

     static create(): Guy{
        const genome = Genome.random(100)
        return new Guy(0, genome)
    }

     static birth(maze: IMaze, mother: IGuy, father: IGuy){
        const genome = Genome.from(mother.genome.genes)
        genome.mutate(0.01)
        return new Guy(0, genome)
    }

    get age(): number {
        return this._age
    }

    get genome(): IGenome {
        return this._genome
    }

    mutate(rate: number): void {
          if (Math.random() >= rate) {
            const newGene = Math.floor(Math.random() * 2) as 0 | 1 | 2
            switch(newGene)
            {
                case 0:
                    this._genome.swap();
                    break;
                case 1:
                    this._genome.insert();
                    break;
                case 2:
                    this._genome.delete();
                    break;
            }
        }
    }

    vieilliss(){
        this._age++
    }

}