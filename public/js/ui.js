const serverState = document.getElementById("serverState");
const mazeCanvasHeight = Math.floor(window.innerHeight * 0.4);
const mazeCanvas = document.getElementById("mazeCanvas");
const startBtn = document.getElementById("startBtn");
mazeCanvas.width = window.innerWidth;
mazeCanvas.height = 0;
const mazeCellSize = Math.max(5, Math.floor(mazeCanvas.width / 50));
const nbCols = Math.floor(mazeCanvas.width / mazeCellSize);
const nbRows = Math.floor(mazeCanvasHeight / mazeCellSize);
const mazeCtx = mazeCanvas.getContext("2d");
mazeCtx.globalCompositeOperation = "copy";
const solutionsCanvas = document.getElementById("solutionsCanvas");
solutionsCanvas.width = window.innerWidth;
solutionsCanvas.height = 0;
const solutionsCtx = solutionsCanvas.getContext("2d");
solutionsCtx.globalCompositeOperation = "copy";
let maze = null;
let solutionsMaze = null;
let lastState;
let lastSolutions;

function main() {
	const socket = io();
	socket.on("error", console.error);
	socket.on("connect", () => {
		serverState.innerText = "Connected to server and waiting for a maze...";
		socket.on("getMaze", (done, mazeJson) => {
			if (done) {
				serverState.innerText = "Maze terminated";
			} else {
				serverState.innerText = "Generating a maze ...";
			}
			mazeCanvas.height = mazeCanvasHeight;
			solutionsCanvas.height = mazeCanvasHeight;
			maze = Maze.fromJSON(mazeCtx, mazeCellSize, mazeJson);
			solutionsMaze = Maze.fromJSON(solutionsCtx, mazeCellSize, mazeJson);
			maze.draw(lastState);
			solutionsMaze.draw();
			startBtn.style.visibility = "";
		});
		socket.on("worldsState", state => {
			lastState = state;
			maze.draw(state);
			if (lastState.solutions.length > 0) {
				const explorations = {};
				for (const s of lastState.solutions) {
					for (const idx in s.walk.exploration) {
						explorations[idx] = (explorations[idx] ?? 0) + s.walk.exploration[idx];
					}
				}
				lastSolutions = { explorations };
			} else {
				lastSolutions = null;
			}
			solutionsMaze.draw(lastSolutions)
			serverState.innerText = `${state.population} guys around ${Math.round(state.avgAge)} yo (min: ${state.minAge}, max: ${state.maxAge}) - Fitness is around ${state.avgFitness} (min: ${state.minFitness}, max: ${state.maxFitness}) - There are ${state.solutions.length} solutions.`;
			socket.emit("drawn");
		});
		startBtn.onclick = () => socket.emit("start");
		socket.emit("getMaze", nbCols, nbRows);
	});
	socket.on("disconnect", () => {
		console.log('Disconnected from server');
		serverState.innerText = "Disconnected from server";
		maze = null;
		mazeCanvas.height = 0;
	});
}

window.onload = main;
