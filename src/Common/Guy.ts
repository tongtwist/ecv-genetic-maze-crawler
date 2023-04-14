import { IGenome } from "./Genome.spec";
import { IGuy, Position, Walk } from "./Guy.spec";

export class Guy implements IGuy {

    constructor(
        public _age: number,
        public _genome: IGenome,
    ) { }

    walk(target: Position): Walk {
        return { steps: 0, wallHits: 0, backtraacks: 0, targetReached: false };
    }

    mutate(rate: number): void {
        // au hasard tirer un type de mutation (swap, insert, delete)
        const randomNum = Math.random();
        if (randomNum < rate / 3) {
            // swap
            const idx = Math.floor(Math.random() * (this._genome.length - 1));
            this._genome.swap(idx);
        } else if (randomNum < (2 * rate) / 3) {
            // insert
            const idx = Math.floor(Math.random() * this._genome.length);
            this._genome.insert(idx);
        } else {
            // delete
            const idx = Math.floor(Math.random() * this._genome.length);
            this._genome.delete(idx);
        }
    }
    vieillis(): void {
        this._age++;
    }

}
