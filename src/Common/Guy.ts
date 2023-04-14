import { IMaze } from "../Server/Maze.spec";
import { Genome } from "./Genome";
import { IGenome, TGene } from "./Genome.spec";
import { IGuy, Position, Walk } from "./Guy.spec";

export class Guy implements IGuy {
  public age: number;
  public readonly genome: IGenome;
  public readonly maze: IMaze;

  constructor(age: number, genome: IGenome, maze: IMaze) {
    this.age = age;
    this.genome = genome;
    this.maze = maze;
  }

  public walk(target: Position): Walk {
    //0 = haut 1 = gauche 2 = droite 3 = bas
    const steps = 0;
    const wallHits = 0;
    const backtracks = 0;
    const targerReached = false;
  }

  public mutate(rate: number): void {
    if (Math.random() <= rate) {
      const randomAction = Math.floor(Math.random() * 3);
      switch (randomAction) {
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

  public vieillis(): void {
    this.age++;
  }

  public create(maze: IMaze) {
    const genome = Genome.random(maze.nbCols + maze.nbRows);
    return new Guy(0, genome, maze);
  }

  public birth(maze: IMaze, mother: IGuy, father: IGuy) {
    const genes: TGene[] = [];
    const nbMax = maze.nbCols + maze.nbRows;
    for (let i = 0; i < nbMax; i++) {
      const random = Math.floor(Math.random() * 2);
      if (random === 0) {
        genes.push(mother.genome.genes[i]);
      } else {
        genes.push(father.genome.genes[i]);
      }
    }
    const genome = new Genome([...genes]);
    return new Guy(0, genome, maze);
  }
}
