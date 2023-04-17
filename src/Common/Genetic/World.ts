import { IMaze } from "../Maze.spec";
import { Guy } from "./Guy";
import { Generation, IWorld, Solution } from "./World.spec";

export class World implements IWorld {
    private readonly _maze: IMaze;
    private _populations: number;
    private _solutions: Solution[];
    private _generation: number;
    private _minAge: number;
    private _maxAge: number;
    private _avgAge: number;
    private _minFitness: number;
    private _maxFitness: number;
    private _avgFitness: number;

    constructor(maze: IMaze) {
        this._maze = maze;
        this._populations = 0;
        this._solutions = [];
        this._generation = 0;
        this._minAge = 0;
        this._maxAge = 0;
        this._avgAge = 0;
        this._minFitness = 0;
        this._maxFitness = 0;
        this._avgFitness = 0;
    }

    generatePopulation(nbGuys: number): void {
        for(let i = 0; i < nbGuys; i++) {
            // Generate guy
            this._populations++;
        }
    }
    nextGeneration(solutionFitness: number): Generation {
        return {
            population: 0,
            solutions: [],
            generation: this._generation++,
            minAge: 0,
            maxAge: 0,
            avgAge: 0,
            minFitness: 0,
            maxFitness: 0,
            avgFitness: 0,
        };
    }
    
}