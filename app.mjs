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

const players = [];

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.emit("init", { id: socket.id, plyrs: players });

  socket.on("newPlayer", (obj) => {
    players.push(obj);
    console.log("server player array", players.length);
    socket.broadcast.emit("newPlayer", obj);
  });
  socket.on("move-player", (dir) =>
    socket.broadcast.emit("move-player", { id: socket.id, dir })
  );
  socket.on("stop-player", (dir) =>
    socket.broadcast.emit("stop-player", { id: socket.id, dir })
  );
});
