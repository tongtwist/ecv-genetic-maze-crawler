import {IGenome} from './Genome.spec'
import {IGuy, Position, Walk} from './Guy.spec'

export class Guy implements IGuy{
    age: number;
    genome: IGenome;


    constructor(age: number, genome: IGenome) {
        this.age = age;
        this.genome = genome;
    }

    walk(target: Position): Walk {

    }

    mutate(rate: number): void{
        const rateRandom = Math.random()
        if (rateRandom < rate) {
            const gene = Math.floor(Math.random() * 3);
            switch (gene) {
                case 0:
                    this.genome.swap();
                    break;
                case 1:
                    this.genome.insert();
                    break;
                case 2:
                    this.genome.delete();
                    break;
            }
        }
    }

    vieillis(): void{
        this.age++;
    }
}