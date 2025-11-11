// server/gameState.js
let gameState = {
  result: null,
  lastRoll: null,
  nextRoll: null,
  round: 0,
  dice1: null,
  dice2: null,
  dice3: null,
  sum: null,
};

function updateGameState(result) {
  const now = Date.now();

  gameState.lastRoll = gameState.result;
  gameState.result = result;
  gameState.nextRoll = now + 25000;
  gameState.round += 1;

  gameState.dice1 = result.dice1;
  gameState.dice2 = result.dice2;
  gameState.dice3 = result.dice3;
  gameState.sum = result.sum;

  console.log(`🎲 [Vòng ${gameState.round}] ${result.result} (${result.dice1},${result.dice2},${result.dice3})`);
}

module.exports = { gameState, updateGameState };
