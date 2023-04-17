import { IGenome } from "./Genome.spec";
import { IGuy, Position, Walk } from "./Guy.spec";
import { IMaze } from "../Maze.spec";

export class Guy implements IGuy {
  private _age: number;
  private _genome: IGenome;
  private _maze: IMaze;

  constructor(genome: IGenome, maze: IMaze) {
    this._age = 0;
    this._genome = genome;
    this._maze = maze;
  }

  get age(): number {
    return this._age;
  }

  get genome(): IGenome {
    return this._genome;
  }

  public vieillis(): void {
    this._age++;
  }

  public mutate(rate: number): void {
    if (Math.random() < rate) {
      const random = Math.floor(Math.random() * 3);
      switch (random) {
        case 0:
          this._genome.insert();
          break;
        case 1:
          this._genome.swap();
          break;
        case 2:
          this._genome.delete();
          break;
      }
    }
  }

  public walk(target: Position): Walk {
    let _posX = 0;
    let _posY = 0;
    let _steps = 0;
    let _wallHits = 0;
    let _backtracks = 0;
    let _targetReached = false;

    this.genome.genes.forEach((gene) => {
      if (gene === 0) {
        const idxMaze = this._maze.getIdx(_posX, _posY--);
        const maybeWall = this._maze.grid[idxMaze].walls[gene];
        if (maybeWall) {
          _wallHits++;
          _backtracks++;
        } else {
          _posY++;
        }
      }
      if (gene === 1) {
        const idxMaze = this._maze.getIdx(_posX--, _posY);
        const maybeWall = this._maze.grid[idxMaze].walls[gene];
        if (maybeWall) {
          _wallHits++;
          _backtracks++;
        } else {
          _posX--;
        }
      }
      if (gene === 2) {
        const idxMaze = this._maze.getIdx(_posX++, _posY);
        const maybeWall = this._maze.grid[idxMaze].walls[gene];
        if (maybeWall) {
          _wallHits++;
          _backtracks++;
        } else {
          _posX++;
        }
      }
      if (gene === 3) {
        const idxMaze = this._maze.getIdx(_posX, _posY--);
        const maybeWall = this._maze.grid[idxMaze].walls[gene];
        if (maybeWall) {
          _wallHits++;
          _backtracks++;
        } else {
          _posY--;
        }
      }

      if (_posX === target.x && _posY === target.y) {
        _targetReached = true;
        return;
      }

      _steps++;
    });

    return {
      steps: _steps,
      wallHits: _wallHits,
      backtracks: _backtracks,
      targetReached: _targetReached,
    };
  }

  public static generate(genome: IGenome, maze: IMaze): Guy {
    return new Guy(genome, maze);
  }
}
