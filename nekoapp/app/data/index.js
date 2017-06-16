'use strict'

const SENTENCES = { ja_advanced: require('./sentences_ja_advanced.json') }

var pick = function (language, level) {
  let list = SENTENCES[language + '_' + level]
  console.log(language + '_' + level)
  if (!list) {
    let message = level + '/' + language + ' is not supported yet'
    return { q: message, a: message }
  }
  return list[Math.floor(Math.random() * list.length)]
}

module.exports = {
  pick
}
