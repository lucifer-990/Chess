
import { useState } from "react";

const initialPieces = {
  "0-1": "♞", 
  "0-6": "♞",
  "7-1": "♘",
  "7-6": "♘",
};

const Chessboard = () => {
  const [flipped, setFlipped] = useState(false);
  const [pieces, setPieces] = useState(initialPieces);
  const [dragged, setDragged] = useState(null);

  const handleDragStart = (square) => {
    setDragged(square);
  };

  const handleDrop = (square) => {
    if (!dragged) return;
    const newPieces = { ...pieces };
    newPieces[square] = newPieces[dragged]; // Move piece
    delete newPieces[dragged]; // Clear old square
    setPieces(newPieces);
    setDragged(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Allow drop
  };

  const board = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = `${row}-${col}`;
      const isLight = (row + col) % 2 === 0;
      const piece = pieces[square];

      board.push(
        <div
          key={square}
          onDrop={() => handleDrop(square)}
          onDragOver={handleDragOver}
          className={`flex items-center justify-center ${
            isLight ? "bg-[#f0d9b5]" : "bg-[#b58863]"
          }`}
        >
          {piece && (
            <span
              draggable
              onDragStart={() => handleDragStart(square)}
              className={`text-4xl cursor-grab select-none ${
                flipped ? "rotate-180" : ""
              } ${
                piece === "♘" || piece === "♙" || piece === "♔" || piece === "♕"
                  ? "text-white drop-shadow-[0_0_2px_rgba(0,0,0,1)]"
                  : "text-black"
              } ${dragged === square ? "opacity-50" : ""}`}
            >
              {piece}
            </span>
          )}
        </div>
      );
    }
  }

  return (
    <div className="w-full h-screen bg-black/70 flex items-center justify-center">
      <div
        className={`grid grid-cols-8 grid-rows-8 w-96 h-96 transition-transform duration-300 ${
          flipped ? "rotate-180" : ""
        }`}
      >
        {board}
      </div>
      <button
        onClick={() => setFlipped(!flipped)}
        className="absolute bottom-10 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-200"
      >
        Flip Board
      </button>
    </div>
  );
};

export default Chessboard;
