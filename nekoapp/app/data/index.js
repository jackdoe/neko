'use strict'

const SENTENCES = require('./sentences.json')

var pick = function () {
  return SENTENCES[Math.floor(Math.random() * SENTENCES.length)]
}

module.exports = {
  pick
}
