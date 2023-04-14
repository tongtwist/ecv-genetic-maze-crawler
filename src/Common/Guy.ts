import {IGuy, Position, Walk} from "./Guy.spec";
import {IGenome, TGene} from "./Genome.spec";
import {IMaze} from "../Server/Maze.spec";
import {Genome} from "./Genome";

export class Guy implements IGuy {
    age: number;
    genome: IGenome;
    public readonly maze: IMaze;
    constructor(genome: IGenome, maze: IMaze) {
        this.age = 0;
        this.genome = genome;
        this.maze = maze;
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
        const genome = Genome.random(maze.nbCols + maze.nbRows);
        return new Guy(genome, maze);
    }

    public birth(maze:IMaze, mother:IGuy, father: IGuy){
        const genes: TGene[] = [];
        const nbGenes = maze.nbCols + maze.nbRows;
        for (let i = 0; i < nbGenes; i++) {
            const gene = Math.floor(Math.random() * 2);
            if (gene === 0){
                genes.push(mother.genome.genes[i]);
            } else {
                genes.push(father.genome.genes[i]);
            }
        }
        const genome = new Genome(genes);
        return new Guy(genome, maze);
    }

    walk(target: Position): Walk {
        let x = 0;
        let y = 0;
        let steps = 0;
        let wallHits = 0;
        let backtracks = 0;
        let targetReached = false;

        return {steps, wallHits, backtracks, targetReached};
    }

        /*public getNextGene(): void {
            this.currentGeneIndex++;
            if (this.currentGeneIndex === this.genes.length) {
                this.currentGeneIndex = 0;
            }
        }*/

   /* public walk(target: Position): Walk {
        let x = 0;
        let y = 0;
        let steps = 0;
        let wallHits = 0;
        let backtracks = 0;
        let targetReached = false;

        const guy = this.create(this.maze);
        let currentGuy = guy;
        let previousGene = -1;
        while (!targetReached) {
            const currentPos = { x: x, y: y };
            const direction = currentGuy.genome.getNextGene(previousGene);

            if (direction === 0) {
                y--;
            } else if (direction === 1) {
                x--;
            } else if (direction === 2) {
                x++;
            } else if (direction === 3) {
                y++;
            }


            if (this.maze.isWall(x, y)) {
                wallHits++;
                x = currentPos.x;
                y = currentPos.y;
                currentGuy.genome.getNextGene(previousGene);
                previousGene = direction;
            } else if (x === target.x && y === target.y) {
               targetReached = true;
            } else {
                 const child = this.birth(this.maze, currentGuy, guy);
                currentGuy = child;
                previousGene = direction;
            }

            steps++;
        }

        return {
            steps: steps,
            wallHits: wallHits,
            backtracks: backtracks,
            targetReached: targetReached
        };
    }*/


}