'use strict';

module.exports = {
  clamp: function(number, min, max) {
    return Math.min(Math.max(number, min), max);
  }
};
