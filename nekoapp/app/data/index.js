'use strict'

const SENTENCES = {
  ja_advanced: require('./sentences/ja_advanced.json'),
  ja_intermediate: require('./sentences/ja_intermediate.json'),
  ja_beginner: require('./sentences/ja_beginner.json'),
  nl_advanced: require('./sentences/nl_advanced.json'),
  nl_intermediate: require('./sentences/nl_intermediate.json'),
  nl_beginner: require('./sentences/nl_beginner.json')
}

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
