import { IGenome } from "./Genome.spec";
import { IGuy, Position, Walk } from "./Guy.spec";

export class Guy implements IGuy {
    constructor(
        private _age: number,
        private _genome: IGenome,
    ) { }

    get age(): number {
        return this._age;
    }

    get genome(): IGenome {
        return this._genome;
    }

    walk(target: Position): Walk {
        throw new Error("Method not implemented.");
    }

    mutate(rate: number): void {
        for (let i = 0; i < this._genome.getGenomeLength(); i++) {
            if (Math.random() < rate) {
                const rand = Math.floor(Math.random() * 3);
                switch (rand) {
                    case 0:
                        this._genome.swap(i);
                        break;
                    case 1:
                        this._genome.insert(i);
                        break;
                    case 2:
                        this._genome.delete(i);
                        break;
                }
            }
        }
    }

    vieillis(): void {
        this._age++;
    }
}