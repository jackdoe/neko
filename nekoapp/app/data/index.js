'use strict'

const DICT = require('./edict.json')

var pick = function () {
  let element = DICT[Math.floor(Math.random() * DICT.length)]
  let entry =
    element.entries[Math.floor(Math.random() * element.entries.length)]
  return entry
}

module.exports = {
  pick
}
