import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";

///////////////////////////////////////////////////////////////////////////////

const app = express();
const server = http.createServer(app);
server.listen(3000, () => console.log("Server listening on port 3000"));
const io = new Server(server);

///////////////////////////////////////////////////////////////////////////////

const __dirname = path.resolve(
  path.dirname(decodeURI(new URL(import.meta.url).pathname))
);
app.use(express.static(__dirname + "/"));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "/index.html")));

///////////////////////////////////////////////////////////////////////////////
import Coin from "./js/coin.mjs";

let players = [];
let coins = [];

for (let i = 0; i < 20; i++) {
  coins.push(
    new Coin({ id: i, x: Math.random() * 800, y: Math.random() * 600 })
  );
}

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.emit("init", { id: socket.id, plyrs: players, coins });

  socket.on("new-player", (obj) => {
    obj.id = socket.id;
    players.push(obj);
    console.log("server player array", players.length);
    socket.broadcast.emit("new-player", obj);
  });

  socket.on("move-player", (dir) =>
    socket.broadcast.emit("move-player", { id: socket.id, dir })
  );
  socket.on("stop-player", (dir) =>
    socket.broadcast.emit("stop-player", { id: socket.id, dir })
  );

  socket.on("destroy-item", ({ playerId, coinId }) => {
    if (coins.find((v) => v.id === coinId)) {
      const player = players.find((v) => v.id === playerId);
      const sock = io.sockets.sockets.get(player.id);
      coins = coins.filter((v) => v.id !== coinId);
      player.xp += 10;
      socket.broadcast.emit("destroy-item", { coinId });

      sock.emit("update-player", player);

      if (player.xp === 100) {
        sock.emit("end-game", "win");
        sock.broadcast.emit("end-game", "lose");
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    players = players.filter((v) => v.id !== socket.id);
    socket.broadcast.emit("remove-player", { id: socket.id });
  });
});
