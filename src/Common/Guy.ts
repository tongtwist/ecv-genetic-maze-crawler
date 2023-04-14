import { IGenome } from "./Genome.spec";
import { IGuy, Position, Walk } from "./Guy.spec";

export class Guy implements IGuy {
  constructor(public age: number, public readonly genome: IGenome) {}

  walk(target: Position): Walk {
    // 0 haut, 1 gauche, 2 droite, 3 bas

    for (let i in this.genome.genes) {
      switch (this.genome.genes[i]) {
        case 0:
          target.y++;
          break;
        case 1:
          target.x--;
          break;
        case 2:
          target.x++;
          break;
        case 3:
          target.y--;
          break;
      }
    }

    return {
      steps: 0,
      wallHits: 0,
      backtracks: 0,
      targetReached: true,
    };
  }

  mutate(rate: number): void {
    const randomValue = Math.random();

    if (randomValue <= rate) {
      const randomMethod = Math.floor(Math.random() * 3);
      this.vieillis();

      switch (randomMethod) {
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

  vieillis(): void {
    this.age++;
  }
}
