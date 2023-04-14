import type { IMaze } from "../../Server/Maze.spec";
import type { TCellJSON, ICell } from "./Cell.spec";

export class Cell implements ICell {
  private readonly _walls: [boolean, boolean, boolean, boolean];
  private readonly _grid: ICell[];
  private readonly _idx: number;
  private _visited: boolean;

  constructor(
    private readonly _maze: IMaze,
    private readonly _i: number,
    private readonly _j: number,
    walls?: [boolean, boolean, boolean, boolean]
  ) {
    this._grid = this._maze.grid;
    this._idx = this._maze.getIdx(this._i, this._j);
    this._visited = Array.isArray(walls);
    this._walls = this._visited ? walls! : [true, true, true, true];
  }

  get visited(): boolean {
    return this._visited;
  }
  get walls(): ICell["walls"] {
    return this._walls;
  }
  get i(): number {
    return this._i;
  }
  get j(): number {
    return this._j;
  }
  get idx(): number {
    return this._idx;
  }

  setVisited(): void {
    this._visited = true;
  }

  checkNeighbors(): ICell | undefined {
    const neighbors = [];
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        if (Math.abs(j) !== Math.abs(i)) {
          const ni = Math.max(0, Math.min(this._maze.nbCols - 1, this.i + i));
          const nj = Math.max(0, Math.min(this._maze.nbRows - 1, this.j + j));
          const nIdx = this._maze.getIdx(ni, nj);
          if (nIdx !== this.idx) {
            const n = this._grid[nIdx];
            if (!n.visited) {
              neighbors.push(n);
            }
          }
        }
      }
    }
    if (neighbors.length > 0) {
      const rIdx = Math.floor(Math.random() * neighbors.length);
      return neighbors[rIdx];
    }
  }

  removeWallWith(neighbor: ICell) {
    const distIdx = this._maze.getIdx(neighbor.i, neighbor.j) - this.idx;
    const wallIdx = this._maze.getNeighborsIdxDistance(distIdx);
    if (wallIdx >= 0) {
      this._walls[wallIdx] = false;
    }
  }

  toJSON(): TCellJSON {
    let flags = 0;
    for (let i = 0; i < this._walls.length; i++) {
      flags = this._walls[i] ? flags | (1 << i) : flags;
    }
    return flags;
  }

  static wallsFromJSON(j: number): [boolean, boolean, boolean, boolean] {
    return [(1 & j) > 0, (2 & j) > 0, (4 & j) > 0, (8 & j) > 0];
  }
}
