import React, { useState, useEffect } from 'react';
import './App.css';

const gridSize = 5;
const BLUE = "#1371bb";
const BLACK = "#343235";

// define the 5x5 tile patterns
const tilePatterns = [
  [["", "", "", BLUE], ["", "", BLUE, BLACK], ["", "", BLACK, BLUE], ["", "", BLUE, BLACK], ["", "", BLACK, ""]],
  [["", BLUE, "", BLACK], [BLUE, BLACK, BLACK, BLACK], [BLACK, BLUE, BLACK, BLACK], [BLUE, BLACK, BLACK, BLUE], [BLACK, "", BLUE, ""]],
  [["", BLACK, "", BLUE], [BLACK, BLACK, BLUE, BLACK], [BLACK, BLACK, BLACK, BLACK], [BLACK, BLUE, BLACK, BLACK], [BLUE, "", BLACK, ""]],
  [["", BLUE, "", BLACK], [BLUE, BLACK, BLACK, BLUE], [BLACK, BLACK, BLUE, BLACK], [BLACK, BLACK, BLACK, BLUE], [BLACK, "", BLUE, ""]],
  [["", BLACK, "", ""], [BLACK, BLUE, "", ""], [BLUE, BLACK, "", ""], [BLACK, BLUE, "", ""], [BLUE, "", "", ""]]
];

// define the "victory pattern" across the 7 tiles that contain it
const victoryPatterns = {
  center: `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <path d="M 0 100 A 50 50 0 0 1 100 0" stroke="${BLACK}" stroke-width="64" fill="none" stroke-linecap="round"/>
      <path d="M 0 0 A 50 50 0 0 1 100 100" stroke="${BLACK}" stroke-width="64" fill="none" stroke-linecap="round"/>
    </svg>
  `,
  topCenter: `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <path d="M 100 100 A 50 50 0 0 1 0 0" stroke="${BLACK}" stroke-width="64" fill="none" stroke-linecap="round"/>
    </svg>
  `,
  leftCenter: `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <path d="M 0 0 A 50 50 0 0 1 100 100" stroke="${BLACK}" stroke-width="64" fill="none" stroke-linecap="round"/>
    </svg>
  `,
  rightCenter: `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <path d="M 100 100 A 50 50 0 0 1 0 0" stroke="${BLACK}" stroke-width="64" fill="none" stroke-linecap="round"/>
    </svg>
  `,
  bottomCenter: `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <path d="M 100 0 A 50 60 0 0 1 100 100" stroke="${BLACK}" stroke-width="64" fill="none" stroke-linecap="round"/>
    </svg>
  `,
  innerLeft: `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <path d="M 100 0 A 50 50 0 0 1 0 100" stroke="${BLACK}" stroke-width="64" fill="none" stroke-linecap="round"/>
    </svg>
  `,
  bottomRight: `
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <path d="M 0 100 A 50 50 0 0 1 100 0" stroke="${BLACK}" stroke-width="64" fill="none" stroke-linecap="round"/>
    </svg>
  `
};

// account for the two way symmetrical tiles
const dualTiles = [
  { row: 1, col: 3, pattern: [BLUE, BLACK, BLACK, BLUE] },
  { row: 3, col: 1, pattern: [BLUE, BLACK, BLACK, BLUE] }
];
// account for the 4 way symmetrical center tile
const isCenterTile = (row, col) => row === 2 && col === 2;

const getVictoryPattern = (row, col) => {
  if (row === 2 && col === 2) return victoryPatterns.center;
  if (row === 1 && col === 2) return victoryPatterns.topCenter;
  if (row === 2 && col === 1) return victoryPatterns.leftCenter;
  if (row === 2 && col === 3) return victoryPatterns.rightCenter;
  if (row === 3 && col === 2) return victoryPatterns.bottomCenter;
  if (row === 1 && col === 1) return victoryPatterns.innerLeft;
  if (row === 3 && col === 3) return victoryPatterns.bottomRight;
  return null;
};

const PuzzleGame = () => {
  const [grid, setGrid] = useState([]);
  const [isVictory, setIsVictory] = useState(false);
  const [totalRotations, setTotalRotations] = useState([]);
  const [rotatingTile, setRotatingTile] = useState(null);
  const [showVictoryPattern, setShowVictoryPattern] = useState(false);

  const rotatePattern = (pattern, rotation) => {
    const rotations = Math.floor((rotation / 90)) % 4;
    return [...pattern.slice(rotations), ...pattern.slice(0, rotations)];
  };

  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  const checkTileMatch = (currentPattern, expectedPattern, rotation) => {
    if (dualTiles.some(dt => arraysEqual(dt.pattern, expectedPattern))) {
      const rotated = rotatePattern(currentPattern, rotation);
      const valid0 = arraysEqual(rotated, expectedPattern);
      const valid180 = arraysEqual(rotated, rotatePattern(expectedPattern, 180));
      return valid0 || valid180;
    }

    if (expectedPattern.every(color => color === BLACK)) {
      return currentPattern.every(color => color === BLACK);
    }

    return arraysEqual(rotatePattern(currentPattern, rotation), expectedPattern);
  };

  const checkVictory = (currentGrid, currentRotations) => {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (isCenterTile(row, col)) continue;
        const tile = currentGrid[row][col];
        const expectedPattern = tilePatterns[row][col];
        const rotation = currentRotations[row * gridSize + col];
        if (!checkTileMatch(tile.pattern, expectedPattern, rotation)) {
          return false;
        }
      }
    }
    return true;
  };

  useEffect(() => {
    createGrid();
  }, []);

  function createGrid() {
    const newGrid = [];
    const newTotalRotations = [];
    for (let row = 0; row < gridSize; row++) {
      let rowArr = [];
      for (let col = 0; col < gridSize; col++) {
        const initialRotation = Math.floor(Math.random() * 4) * 90;
        newTotalRotations.push(initialRotation);
        const pattern = tilePatterns[row][col];
        rowArr.push({
          id: `${row}-${col}`,
          rotation: initialRotation,
          visualRotation: initialRotation,
          pattern
        });
      }
      newGrid.push(rowArr);
    }
    setGrid(newGrid);
    setTotalRotations(newTotalRotations);
    setIsVictory(false);
  }

  function rotateTile(row, col) {
    if (isVictory) return;

    const newGrid = [...grid.map(row => [...row])];
    const tile = newGrid[row][col];
    const index = row * gridSize + col;

    setRotatingTile(`${row}-${col}`);
    setTimeout(() => setRotatingTile(null), 300);

    const newTotalRotations = [...totalRotations];
    newTotalRotations[index] = (totalRotations[index] + 90) % 360;

    tile.visualRotation = tile.visualRotation + 90;
    tile.rotation = newTotalRotations[index];

    const victory = checkVictory(newGrid, newTotalRotations);

    setGrid(newGrid);
    setTotalRotations(newTotalRotations);
    setIsVictory(victory);
  }
  useEffect(() => {
    if (isVictory) {
      setTimeout(() => {
        setShowVictoryPattern(true);
      }, 100);
    } else {
      setShowVictoryPattern(false);
    }
  }, [isVictory]);

  return (
    <div className="puzzle-container">
      <button
        onClick={createGrid}
        className="reset-button"
      >
        Reset Puzzle
      </button>
      <div className="puzzle-grid">
        {grid.map((row, rowIndex) => (
          row.map((tile, colIndex) => (
            <div
              key={tile.id}
              className="puzzle-tile"
              onClick={() => rotateTile(rowIndex, colIndex)}
            >
              <div
                className={`tile-content ${rotatingTile === tile.id ? 'tile-hover' : ''
                  }`}
              >
                <div
                  className="tile-rotatable"
                  style={{
                    transform: `rotate(${tile.visualRotation}deg)`
                  }}
                >
                  {tile.pattern.map((color, index) => (
                    color && (
                      <div
                        key={index}
                        className={`quadrant ${index === 0 ? 'quadrant-tl' :
                            index === 1 ? 'quadrant-tr' :
                              index === 2 ? 'quadrant-bl' :
                                'quadrant-br'
                          }`}
                      >
                        <svg viewBox="0 0 50 50">
                          <path
                            // draw corner quadrants
                            d={
                              index === 0 ? "M32,0 A32,32 0 0,1 0,32 L0,0 Z" :
                              index === 1 ? "M18,0 A32,32 0 0,0 50,32 L50,0 Z" :
                              index === 2 ? "M0,18 A32,32 0 0,1 32,50 L0,50 Z" :
                                            "M18,50 A32,32 0 0,1 50,18 L50,50 Z"
                            }
                            fill={color}
                          />
                        </svg>
                      </div>
                    )
                  ))}
                </div>
                {/* Victory overlay (connect the dots) */}
                {isVictory && getVictoryPattern(rowIndex, colIndex) && (
                  <div
                    className={`victory-pattern ${showVictoryPattern ? 'visible' : ''}`}
                    dangerouslySetInnerHTML={{
                      __html: getVictoryPattern(rowIndex, colIndex)
                    }}
                  />
                )}
              </div>
            </div>
          ))
        ))}
      </div>
    </div>
  );
};

export default PuzzleGame;