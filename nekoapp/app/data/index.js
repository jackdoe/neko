'use strict'

const DICT = require('./edict.json')

var pick = function () {
  return DICT[Math.floor(Math.random() * DICT.length)]
}

module.exports = {
  pick
}
