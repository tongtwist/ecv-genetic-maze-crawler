import { IMaze } from "../Server/Maze.spec";
import { Genome } from "./Genome";
import { IGenome, TGene } from "./Genome.spec";
import { IGuy, Position, Walk } from "./Guy.spec";

export class Guy implements IGuy {
  age: number;
  genome: IGenome;

  constructor(genome: IGenome) {
    this.age = 0;
    this.genome = genome;
  }

  create(maze: IMaze) {
    const genome = Genome.random(maze.nbCols + maze.nbRows);
    return new Guy(genome);
  }

  birth(maze: IMaze, mother: IGuy, father: IGuy) {
    const genes: TGene[] = [];
    const nbGenes = maze.nbCols + maze.nbRows;
    for (let i = 0; i < nbGenes; i++) {
      const gene = Math.floor(Math.random() * 2);
      if (gene === 0) {
        genes.push(mother.genome.genes[i]);
      } else {
        genes.push(father.genome.genes[i]);
      }
    }
    const genome = new Genome(genes);
    return new Guy(genome);
  }

  walk(target: Position): Walk {
    let x = 0;
    let y = 0;
    let steps = 0;
    let wallHits = 0;
    let backtracks = 0;
    let targetReached = false;

    while (x !== target.x || y !== target.y) {
      const gene = this.genome.genes[steps % this.genome.length];

      if (gene === 0) {
        x++;
      }

      if (gene === 1) {
        y++;
      }

      if (gene === 2) {
        x--;
      }

      if (gene === 3) {
        y++;
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

    return { steps, wallHits, backtracks, targetReached };
  }

  mutate(rate: number): void {
    if (Math.random() < rate) {
      const gene = Math.floor(Math.random() * 3);

      if (gene === 0) {
        this.genome.swap();
      }

      if (gene === 1) {
        this.genome.insert();
      }

      if (gene === 2) {
        this.genome.delete();
      }
    }
  }

  vieillis(): void {
    this.age++;
  }
}
