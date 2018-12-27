/* eslint-disable no-extend-native */

Array.prototype.move = function move(from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};
