import Player from "./player.mjs";
import controls from "./controls.mjs";
import Coin from "./coin.mjs";

const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let players = [];
let items = [];
let endGame;

socket.on("init", ({ id, plyrs, coins }) => {
  const player = new Player({ id, main: true });
  controls(player, socket);
  console.log(player);
  socket.emit("new-player", player);

  socket.on("new-player", (obj) => players.push(new Player(obj)));

  socket.on("move-player", ({ id, dir }) =>
    players.find((v) => v.id === id).move(dir)
  );
  socket.on("stop-player", ({ id, dir }) =>
    players.find((v) => v.id === id).stop(dir)
  );

  socket.on("destroy-item", (id) => (items = items.filter((v) => v.id !== id)));
  socket.on(
    "remove-player",
    (id) => (players = players.filter((v) => v.id !== id))
  );

  socket.on("end-game", (result) => (endGame = result));
  socket.on("update-player", (obj) => (player.xp = obj.xp));

  ////////////////////////////////////////////////////////////////////////////////////

  players = plyrs.map((v) => new Player(v)).concat(player);
  items = coins.map((v) => new Coin(v));

  ////////////////////////////////////////////////////////////////////////////////////

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    players.forEach((v) => v.draw(ctx, items));

    items.forEach((v) => {
      v.draw(ctx);
      if (v.destroyed) {
        socket.emit("destroy-item", { playerId: v.destroyed, coinId: v.id });
        console.log("destroyed", v.destroyed);
      }
    });

    items = items.filter((v) => !v.destroyed);

    if (endGame) {
      ctx.fillStyle = endGame === "win" ? "green" : "red";
      ctx.font = "100px Arial";
      ctx.fillText(`YOU ${endGame}`, 100, 100);
    }

    !endGame && requestAnimationFrame(draw);
  };

  ////////////////////////////////////////////////////////////////////////////////////

  draw();
});
