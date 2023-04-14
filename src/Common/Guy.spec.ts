import { IGenome } from "./Genome.spec";

export type Position = {
  x: number;
  y: number;
};

export type Walk = {
  readonly steps: number;
  readonly wallHits: number;
  readonly backtracks: number;
  readonly targetReached: boolean;
};

export interface IGuy {
  readonly age: number;
  readonly genome: IGenome;
  walk(target: Position): Walk;
  mutate(rate: number): void;
  vieillis(): void;
}
