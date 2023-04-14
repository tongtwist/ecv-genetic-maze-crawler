import {IGuy, Position, Walk} from "./Guy.spec";
import {IGenome, TGene} from "./Genome.spec";
import {IMaze} from "../Server/Maze.spec";
import {Genome} from "./Genome";

export class Guy implements IGuy {
    age: number;
    genome: IGenome;

    constructor(genome: IGenome) {
        this.age = 0;
        this.genome = genome;
    }

    public walk(target: Position): Walk {
        let x = 0;
        let y = 0;
        let steps = 0;
        let wallHits = 0;
        let backtracks = 0;
        let targetReached = false;
        while (x !== target.x || y !== target.y) {
            const gene = this.genome.genes[steps % this.genome.length];
            switch (gene) {
                case 0:
                    x++;
                    break;
                case 1:
                    y++;
                    break;
                case 2:
                    x--;
                    break;
                case 3:
                    y--;
                    break;
            }
            if (x < 0 || y < 0) {
                wallHits++;
            }
            if (x > target.x || y > target.y) {
                backtracks++;
            }
            if (x === target.x && y === target.y) {
                targetReached = true;
            }
            steps++;
        }
        return {steps, wallHits, backtracks, targetReached};
    }

    public muatate(rate: number): void {
        if (Math.random() < rate) {
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

    public vieillir(): void {
        this.age++;
    }

    public create(maze:IMaze){
        const genome = Genome.random(100);
        return new Guy(genome);
    }

    public birth(maze:IMaze, mother:IGuy, father: IGuy){
        const genes: TGene[] = [];
        for (let i = 0; i < 100; i++) {
            const gene = Math.floor(Math.random() * 2);
            if (gene === 0){
                genes.push(mother.genome.genes[i]);
            } else {
                genes.push(father.genome.genes[i]);
            }
        }
        const genome = new Genome(genes);
        return new Guy(genome);
    }
}