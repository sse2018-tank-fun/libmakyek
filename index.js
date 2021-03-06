const constant = require('./constant');
const validation = require('./validation');

const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

function MakyekBoard(onUpdate) {
  this.size = 8;
  this.fnOnUpdate = onUpdate;
  this.clearBoard();
}

/**
 * Clear the board to initial state.
 */
MakyekBoard.prototype.clearBoard = function () {
  this.board = [];
  for (let i = 0; i < this.size; i++) {
    const boardRow = [];
    for (let j = 0; j < this.size; j++) {
      boardRow.push(constant.STATE_EMPTY);
    }
    this.board.push(boardRow);
  }

  for (let i = 1; i < 8; i+=2) {
    this.board[0][i] = constant.STATE_WHITE;
    this.board[2][i] = constant.STATE_WHITE;
    this.board[6][i] = constant.STATE_BLACK;
  }
  for (let i = 0; i < 8; i+=2) {
    this.board[1][i] = constant.STATE_WHITE;
    this.board[5][i] = constant.STATE_BLACK;
    this.board[7][i] = constant.STATE_BLACK;
  }
};

/**
 * Check whether the position is in range of board and on valid positions.
 */
MakyekBoard.prototype.inBound = function (x, y) {
  return x >= 0 && x < this.size && y >= 0 && y < this.size && (x+y)%2;
};

/**
 * Check whether there is an available placement for a specific player.
 * This function only checks pure movement, excluding moving opposite stones
 */
MakyekBoard.prototype.hasAvailablePlacement = function (side) {
  validation.checkPlayerSide(side);

  for (let x = 0; x < this.size; x++) {
    for (let y = 0; y < this.size; y++) {
      if (this.board[x][y] !== side && this.board[x][y] < constant.STATE_REVERSE) {
        continue;
      }
      if (this.board[x][y] == side && side == constant.STATE_BLACK) {
        if ((this.inBound(x - 1, y - 1) && this.board[x - 1][y - 1] == constant.STATE_EMPTY) || 
          (this.inBound(x - 1, y + 1) && this.board[x - 1][y + 1] == constant.STATE_EMPTY)) {
          return true;
        }
      }
      if (this.board[x][y] == side && side == constant.STATE_WHITE) {
        if ((this.inBound(x + 1, y - 1) && this.board[x + 1][y - 1] == constant.STATE_EMPTY) || 
          (this.inBound(x + 1, y + 1) && this.board[x + 1][y + 1] == constant.STATE_EMPTY)) {
          return true;
          }
      }
      if (this.board[x][y] == side + constant.STATE_REVERSE) {
        if ((this.inBound(x + 1, y - 1) && this.board[x + 1][y - 1] == constant.STATE_EMPTY) || 
          (this.inBound(x + 1, y + 1) && this.board[x + 1][y + 1] == constant.STATE_EMPTY) ||
          (this.inBound(x - 1, y - 1) && this.board[x - 1][y - 1] == constant.STATE_EMPTY) || 
          (this.inBound(x - 1, y + 1) && this.board[x - 1][y + 1] == constant.STATE_EMPTY)) {
          return true;
          }
      }
    }
  }

  return false;
};

MakyekBoard.prototype.moveForward = function (side, x0, y0, x1, y1) {
  var isKing = (this.board[x0][y0] == side + constant.STATE_REVERSE);
  if (isKing)
    return true;
  else {
    if (side == constant.STATE_BLACK)
      return (x0 > x1);
    else
      return (x1 > x0);
  }
};

/**
 * Check whether a stone can be placed at a specified place.
 */
MakyekBoard.prototype.canPlaceAt = function (side, x0, y0, x1, y1) {
  x0 = parseInt(x0);
  x1 = parseInt(x1);
  y0 = parseInt(y0);
  y1 = parseInt(y1);

  if (x0 < 0 || x0 > 7 || x1 < 0 || x1 > 7 || y0 < 0 || y0 > 7 || y1 < 0 || y1 > 7) {
    return false;
  }

  if (this.board[x0][y0] !== side && this.board[x0][y0] !== side + constant.STATE_REVERSE) // The intended stone is invalid
    return false;
  
  if (Math.abs(x0 - x1) == 1 && Math.abs(y0 - y1) == 1) {  // Take one single step
    if(this.moveForward(side, x0, y0, x1, y1))
      return (this.board[x1][y1] == constant.STATE_EMPTY);
    return false;
  }
  else if (Math.abs(x0 - x1) == 2 && Math.abs(y0 - y1) == 2) {  // Take one single step and remove the other player's stone
    var middleX = parseInt((x0 + x1) / 2);
    var middleY = parseInt((y0 + y1) / 2);
    var theOtherSide = this.getOtherSide(side);
    var middleStone = (this.board[middleX][middleY] == theOtherSide || this.board[middleX][middleY] == theOtherSide + constant.STATE_REVERSE);
    return (middleStone && this.board[x1][y1] == constant.STATE_EMPTY);
  }
  else
    return false;
};

MakyekBoard.prototype.getOtherSide = function (side) {
  return constant.STATE_REVERSE - side;
};

/**
 * Place a stone at specific position.
 *
 * The position must be validated via canPlaceAt before calling this function,
 * otherwise the behavior is unexpected.
 */
MakyekBoard.prototype.placeAt = function (side, x0, y0, x1, y1, isLastStep) {
  // validation.checkPlayerSide(side);
  x0 = parseInt(x0);
  x1 = parseInt(x1);
  y0 = parseInt(y0);
  y1 = parseInt(y1);

  if (Math.abs(x0 - x1) == 1 && Math.abs(y0 - y1) == 1) {  // Take one single step
    this.board[x1][y1] = this.board[x0][y0];
    this.board[x0][y0] = constant.STATE_EMPTY;
  }

  if (Math.abs(x0 - x1) == 2 && Math.abs(y0 - y1) == 2) {  // Take one single step and remove the other player's stone
    var middleX = parseInt((x0 + x1) / 2);
    var middleY = parseInt((y0 + y1) / 2);
    this.board[x1][y1] = this.board[x0][y0];
    this.board[x0][y0] = constant.STATE_EMPTY;
    this.board[middleX][middleY] = constant.STATE_EMPTY;
  }

  // Update to the king
  if (isLastStep && side == constant.STATE_WHITE && x1 == this.size - 1 && this.board[x1][y1] < constant.STATE_REVERSE)
    this.board[x1][y1] += constant.STATE_REVERSE;
  else if (isLastStep && side == constant.STATE_BLACK && x1 == 0 && this.board[x1][y1] < constant.STATE_REVERSE)
    this.board[x1][y1] += constant.STATE_REVERSE;

  if (this.fnOnUpdate) {  // ?
    this.fnOnUpdate(side, x, y, option);
  }
};

/**
 * Count stones.
 */
MakyekBoard.prototype.count = function () {
  const analytics = {};
  analytics[constant.STATE_EMPTY] = 0;
  analytics[constant.STATE_BLACK] = 0;
  analytics[constant.STATE_WHITE] = 0;
  for (let i = 0; i < this.size; i++) {
    for (let j = 0; j < this.size; j++) {
      if (this.board[i][j] == constant.STATE_BLACK)
        analytics[constant.STATE_BLACK]++;
      if (this.board[i][j] == constant.STATE_WHITE)
        analytics[constant.STATE_WHITE]++;
      if (this.board[i][j] == constant.STATE_BLACK_KING)
        analytics[constant.STATE_BLACK] += 3;
      if (this.board[i][j] == constant.STATE_WHITE_KING)
        analytics[constant.STATE_WHITE] += 3;
    }
  }
  return analytics;
};

module.exports = {
  Board: MakyekBoard,
  STATE_EMPTY: constant.STATE_EMPTY,
  STATE_BLACK: constant.STATE_BLACK,
  STATE_WHITE: constant.STATE_WHITE,
  OPTION_UP: constant.OPTION_UP,
  OPTION_DOWN: constant.OPTION_DOWN,
  OPTION_LEFT: constant.OPTION_LEFT,
  OPTION_RIGHT: constant.OPTION_RIGHT,
  OPTION_UP_LEFT: constant.OPTION_UP_LEFT,
  OPTION_UP_RIGHT: constant.OPTION_UP_RIGHT,
  OPTION_DOWN_LEFT: constant.OPTION_DOWN_LEFT,
  OPTION_DOWN_RIGHT: constant.OPTION_DOWN_RIGHT,
};
