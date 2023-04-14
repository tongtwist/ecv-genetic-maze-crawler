import { IGenome } from "./Genome.spec";
import { IGuy, Position, Walk } from "./Guy.spec";

export class Guy implements IGuy{
    age: number;
    genome: IGenome;

    walk(target: Position): Walk {
        throw new Error("Method not implemented.");
    }
    mutate(rate: number): void {
        throw new Error("Method not implemented.");
    }
    vieillis(): void {
        throw new Error("Method not implemented.");
    }
}