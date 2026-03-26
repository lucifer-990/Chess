import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Chess } from "chess.js";
import toast, { Toaster } from "react-hot-toast";

const socket = io("http://localhost:3000"); 

const Chessboard = () => {
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [playerRole, setPlayerRole] = useState(null);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [sourceSquare, setSourceSquare] = useState(null);

  useEffect(() => {
    socket.on("playerRole", (role) => setPlayerRole(role));
    socket.on("spectatorRole", () => setPlayerRole(null));

    socket.on("boardState", (fen) => {
      chess.load(fen);
      setBoard(chess.board());
    });

    socket.on("move", (move) => {
      chess.move(move);
      setBoard(chess.board());
    });
    socket.on("invalidMove", (move) => {
      toast.error(`Invalid move: ${move.from} → ${move.to}`);
    });
    socket.on("gameOver", ({ result, winner }) => {
        if (result === "checkmate") {
        toast.success(`${winner} wins by checkmate!`);
        } else if (result === "stalemate") {
        toast(`Game drawn by stalemate`, { icon: "🤝" });
        } else if (result === "threefold repetition") {
        toast(`Game drawn by repetition`, { icon: "🔁" });
        } else if (result === "insufficient material") {
        toast(`Game drawn (insufficient material)`, { icon: "⚖️" });
        } else {
        toast(`Game drawn`, { icon: "🤝" });
        }
    });

    return () => {
      socket.off("playerRole");
      socket.off("spectatorRole");
      socket.off("boardState");
      socket.off("move");
      socket.off("invalidMove");
      socket.off("gameOver");
    };
  }, [chess]);

  const getPieceUnicode = (piece) => {
    const map = {
      p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
      P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
    };
    return map[piece.type] || "";
  };

  const handleMove = (source, target) => {
    const move = {
      from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
      to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
      promotion: "q",
    };
    socket.emit("move", move);
  };

  return (
    <div className="w-full h-screen bg-black/70 flex items-center justify-center">
        <Toaster position="top-center" reverseOrder={false} />
      <div
        className={`grid grid-cols-8 grid-rows-8 w-96 h-96 border-2 border-black ${
          playerRole === "b" ? "rotate-180" : ""
        }`}
      >
        {board.map((row, rowIndex) =>
          row.map((square, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const squareColor = isLight ? "bg-[#f0d9b5]" : "bg-[#b58863]";
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`flex items-center justify-center ${squareColor}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedPiece) {
                    const target = { row: rowIndex, col: colIndex };
                    handleMove(sourceSquare, target);
                  }
                }}
              >
                {square && (
                  <span
                    draggable={playerRole === square.color}
                    onDragStart={() => {
                      if (playerRole === square.color) {
                        setDraggedPiece(square);
                        setSourceSquare({ row: rowIndex, col: colIndex });
                      }
                    }}
                    onDragEnd={() => {
                      setDraggedPiece(null);
                      setSourceSquare(null);
                    }}
                    className={`text-4xl select-none cursor-grab ${
                      playerRole === "b" ? "rotate-180" : ""
                    } ${
                      square.color === "w"
                        ? "text-white drop-shadow-[0_0_2px_rgba(0,0,0,1)]"
                        : "text-black"
                    } ${draggedPiece === square ? "opacity-50" : ""}`}
                  >
                    {getPieceUnicode(square)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Chessboard;
