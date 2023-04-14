import type { TCellJSON, ICell } from "../Common/Maze/Cell.spec";

export type TMazeJson = {
  readonly c: number;
  readonly g: TCellJSON[];
};

export interface IMaze {
  readonly nbCols: number;
  readonly nbRows: number;
  readonly grid: ICell[];
  getIdx(i: number, j: number): number;
  getNeighborsIdxDistance(distIdx: number): number;
  generate(sparseRate: number, stepCB?: () => void): void;
  toJSON(): TMazeJson;
}
