const constant = require('./constant');

module.exports = {
  checkPlayerSide(side) {
    if (side !== constant.STATE_BLACK && side !== constant.STATE_WHITE) {
      throw new Error('invalid playerSide');
    }
  },

  checkPlayerOption(option) {
    if (option !== constant.OPTION_UP && option !== constant.OPTION_DOWN &&
      option !== constant.OPTION_LEFT && option !== constant.OPTION_RIGHT &&
      option !== constant.OPTION_UP_LEFT && option !== constant.OPTION_UP_RIGHT &&
      option !== constant.OPTION_DOWN_LEFT && option !== constant.OPTION_DOWN_RIGHT) {
      throw new Error('invalid playerOption');
    }
  },
};
