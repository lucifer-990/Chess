import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Chess } from "chess.js";
import cors from "cors";

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

const chess = new Chess();
let players = {};

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  // assign roles
  if (!players.white) {
    players.white = socket.id;
    socket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "b");
  } else {
    socket.emit("spectatorRole");
  }

  socket.emit("boardState", chess.fen());

  socket.on("move", (move) => {
    try {
      if (chess.turn() === "w" && socket.id !== players.white) return;
      if (chess.turn() === "b" && socket.id !== players.black) return;

      const result = chess.move(move);
      if (result) {
        io.emit("move", move);
        io.emit("boardState", chess.fen());
        if (chess.isCheckmate()) {
            const winner = chess.turn() === "w" ? "Black" : "White";
            io.emit("gameOver", { result: "checkmate", winner });
            chess.reset(); // restart game
        } else if (chess.isDraw()) {
            let reason = "draw";
            if (chess.isStalemate()) reason = "stalemate";
            if (chess.isThreefoldRepetition()) reason = "threefold repetition";
            if (chess.isInsufficientMaterial()) reason = "insufficient material";
            io.emit("gameOver", { result: reason });
            chess.reset();
        }
      } else {
        socket.emit("invalidMove", move);
      }
    } catch (err) {
      console.error(err);
      socket.emit("invalidMove", move);
    }
  });

  socket.on("disconnect", () => {
    if (socket.id === players.white) delete players.white;
    if (socket.id === players.black) delete players.black;
    console.log("user disconnected:", socket.id);
  });
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
