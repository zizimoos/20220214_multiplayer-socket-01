import Player from "./player.mjs";
import controls from "./controls.mjs";

const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const writeToCanvas = (msg) => {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText(msg, 30, 30);
};

let players = [];

socket.on("init", ({ id, plyrs }) => {
  writeToCanvas(`Welcome to the game ${id}`);

  const player = new Player({ id });
  controls(player, socket);

  socket.emit("newPlayer", player);
  socket.on("newPlayer", (obj) => players.push(new Player(obj)));
  socket.on("move-player", ({ id, dir }) =>
    players.find((v) => v.id === id).move(dir)
  );
  socket.on("stop-player", ({ id, dir }) =>
    players.find((v) => v.id === id).stop(dir)
  );

  players = plyrs.map((v) => new Player(v)).concat(player);
  console.log("client player array", players);

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    players.forEach((player) => {
      player.draw(ctx);
    });
    requestAnimationFrame(draw);
  };
  draw();
});
