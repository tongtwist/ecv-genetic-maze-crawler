import type {IMaze} from "./Maze.spec"
import type {Position, Walk, IGuy} from "./Guy.spec"
import {Guy} from "./Guy"
import type { Solution, Generation, IWorld } from "./World.spec"

export class World implements IWorld {
	private _generation = 0
	private _walks: Walk[] = []
	private _explorations: {[k: number]: number} = {}
	private _fitnesses: number[] = []
	private _ranks: number[] = []
	private _target: Position

	constructor(
		private readonly _maze: IMaze,
		private readonly _population: IGuy[],
		private readonly _mutationRate: number,
	) {
		this._target = {
			x: this._maze.nbCols - 1,
			y: this._maze.nbRows - 1,
		}
	}

	private _fitness(walk: Walk): number {
		const maxDistance = this._maze.nbCols + this._maze.nbRows
		let result
		if (walk.closestDistance === 0) {
			result = 1 + (maxDistance / walk.steps)
		} else {
			result = 0
			for (const idx in walk.exploration) {
				result += 1 / this._explorations[idx]
			}
			result = result / walk.steps
			result = result * (1 - walk.closestDistance / maxDistance)
		}
		return result
	}

	private _evaluatePopulation() {
		this._walks = this._population.map((guy: IGuy) => guy.walk(this._target))
		this._explorations = {}
		this._walks.forEach((walk: Walk) => {
			for (const idx in walk.exploration) {
				this._explorations[idx] = (this._explorations[idx] ?? 0) + walk.exploration[idx]
			}
		})
		this._fitnesses = this._walks.map((walk: Walk) => this._fitness(walk))
		this._ranks = []
		for (let i = 0; i < this._population.length; i++) {
			this._ranks.push(i)
		}
		this._ranks.sort((a: number, b: number) => this._fitnesses[b] - this._fitnesses[a])
	}

	private _solutions(minFitness: number): Solution[] {
		const solutions: Solution[] = []
		for (let i = 0; i < this._ranks.length && this._fitnesses[this._ranks[i]] >= minFitness; i++) {
			const guyID = this._ranks[i]
			const fitness = this._fitnesses[guyID]
			const walk = this._walks[guyID]
			solutions.push({guyID, walk, fitness})
		}
		return solutions
	}

	private _turnover() {
		this._population.forEach((guy: IGuy) => guy.vieillis())
		const nbMaxParents = Math.floor(this._ranks.length / 2)
		for (let parentRankIdx = 0, zombieRankIdx = this._ranks.length - 1; parentRankIdx < nbMaxParents; parentRankIdx += 2, zombieRankIdx--) {
			const motherIdx = this._ranks[parentRankIdx]
			const fatherIdx = this._ranks[parentRankIdx + 1]
			const zombieIdx = this._ranks[zombieRankIdx]
			const mother = this._population[motherIdx]
			const father = this._population[fatherIdx]
			const child = Guy.birth(this._maze, mother, father)
			this._population[zombieIdx] = child
		}
	}

	private _createMutations() {
		this._population.forEach((guy: IGuy) => guy.mutate(this._mutationRate))
	}

	private _populationStats(): [number, number, number, number, number, number] {
		const nbGuys = this._population.length
		let minAge = Number.MAX_SAFE_INTEGER
		let maxAge = 0
		let totalAge = 0
		let minFitness = Number.MAX_SAFE_INTEGER
		let maxFitness = 0
		let totalFitness = 0
		for (let i = 0; i < nbGuys; i++) {
			const currentAge = this._population[i].age
			const currentFitness = this._fitnesses[i]
			minAge = Math.min(minAge, currentAge)
			maxAge = Math.max(maxAge, currentAge)
			totalAge += currentAge
			minFitness = Math.min(minFitness, currentFitness)
			maxFitness = Math.max(maxFitness, currentFitness)
			totalFitness += currentFitness
		}
		return [minAge, maxAge, totalAge / nbGuys, minFitness, maxFitness, totalFitness / nbGuys]
	}

	generatePopulation(givenNbGuys: number): void {
		this._generation = 0
		const nbGuys = Math.max(10, givenNbGuys)
		for (let i = 0; i < nbGuys; i++) {
			this._population.push(Guy.create(this._maze))
		}
	}

	evaluatePopulation(solutionFitness: number): Generation {
		this._evaluatePopulation()
		const solutions = this._solutions(solutionFitness)
		const [minAge, maxAge, avgAge, minFitness, maxFitness, avgFitness] = this._populationStats()
		return {
			population: this._population.length,
			generation: this._generation,
			minAge,
			maxAge,
			avgAge,
			minFitness,
			maxFitness,
			avgFitness,
			solutions,
			explorations: {...this._explorations},
		}
	}

	nextGeneration(solutionFitness: number): Generation {
		this._turnover()
		this._createMutations()
		this._generation++
		return this.evaluatePopulation(solutionFitness)
	}

	static createRandomWorld(maze: IMaze, nbGuys: number, mutationRate: number = 0.05): IWorld {
		const population: IGuy[] = []
		for (let i = 0; i < nbGuys; i++) {
			population.push(Guy.create(maze))
		}
		return new World(maze, population, mutationRate)
	}
}