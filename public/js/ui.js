const serverState = document.getElementById("serverState");
const mazeCanvasHeight = Math.min(window.innerHeight, 400);
const mazeCanvas = document.getElementById("mazeCanvas");
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

function main() {
	const socket = io();
	socket.on("error", console.error);
	socket.on("connect", () => {
		serverState.innerText = "Connected to server and waiting for a maze...";
		socket.emit("getMaze", nbCols, nbRows);
		socket.on("getMaze", (done, mazeJson) => {
			if (done) {
				serverState.innerText = "Maze terminated";
			} else {
				serverState.innerText = "Generating a maze ...";
			}
			mazeCanvas.height = mazeCanvasHeight;
			maze = Maze.fromJSON(mazeCtx, mazeCellSize, mazeJson);
			maze.draw();
		});
	});
	socket.on("disconnect", () => {
		console.log('Disconnected from server');
		serverState.innerText = "Disconnected from server";
		maze = null;
		mazeCanvas.height = 0;
	});
}

window.onload = main;
