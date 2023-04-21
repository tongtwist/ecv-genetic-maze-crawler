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
        let currentPosition: Position = { x: 0, y: 0 };
        let currentDirection: Position = { x: 1, y: 0 };
        let steps: number = 0;
        let wallHits: number = 0;
        let backtracks: number = 0;

        while (currentPosition.x !== target.x || currentPosition.y !== target.y) {
            steps++;
            const decision = this._genome._genes[steps % this._genome._length];
            switch (decision) {
                case 0:
                    currentDirection = { x: -currentDirection.y, y: currentDirection.x };
                    break;
                case 1:
                    currentDirection = { x: currentDirection.y, y: -currentDirection.x };
                    break;
                case 2:
                    const nextPosition: Position = { x: currentPosition.x + currentDirection.x, y: currentPosition.y + currentDirection.y };
                    if (nextPosition.x < 0 || nextPosition.y < 0 || nextPosition.x >= 10 || nextPosition.y >= 10) {
                        wallHits++;
                        break;
                    }
                    currentPosition = nextPosition;
                    break;
                case 3:
                    const previousPosition: Position = { x: currentPosition.x - currentDirection.x, y: currentPosition.y - currentDirection.y };
                    if (previousPosition.x < 0 || previousPosition.y < 0 || previousPosition.x >= 10 || previousPosition.y >= 10) {
                        wallHits++;
                        break;
                    }
                    currentPosition = previousPosition;
                    backtracks++;
                    break;
            }
            if (steps > 1000) {
                return { steps, wallHits, backtracks, targetReached: false };
            }
        }
        return { steps, wallHits, backtracks, targetReached: true };
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