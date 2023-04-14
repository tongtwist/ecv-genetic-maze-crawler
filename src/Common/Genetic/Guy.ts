import { IMaze } from "../../Server/Maze.spec";
import { Genome } from "./Genome";
import { IGenome } from "./Genome.spec";
import { IGuy, Position, Walk } from "./Guy.spec";

export class Guy implements IGuy {
    private _age: number;

    constructor(genome: IGenome, maze: IMaze) {
        this._age = 0;
    }

    public static create(maze: IMaze) {
        const genome = Genome.random(maze.nbCols + maze.nbRows);
        return new Guy(genome, maze);
    }

    public static birth(mother: Guy, father: Guy, maze: IMaze) {
        const fatherHalfGenome = father.genome.genes.slice(0, father.genome.length / 2);
        const motherHalfGenome = mother.genome.genes.slice(mother.genome.length / 2, mother.genome.length);
        const genome = Genome.from([...motherHalfGenome, ...fatherHalfGenome]);
        return new Guy(genome, maze);
    }

    get age() {
        return this._age;
    }

    get maze(): IMaze {
        return this.maze;
    }

    get genome(): IGenome {
        return this.genome;
    }

    mutate(rate: number) {
        if (Math.random() <= rate) return;
        const mutation = Math.floor(Math.random() * 3);
        switch (mutation) {
            case 0:
                this.genome.swap();
                break;
            case 1:
                this.genome.insert();
                break;
            default:
                this.genome.delete();
                break;
        }
    }

    walk(target: Position): Walk {
        // TODO
    }

    viellis() {
        this._age++;
    }
}
