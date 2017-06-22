'use strict'

const SENTENCES = {
  ja: require('./sentences/ja.json'),
  nl: require('./sentences/nl.json')
}

const BY_DIFFICULTY = {}
for (let lang in SENTENCES) {
  for (let sentence of SENTENCES[lang]) {
    let difficulty = sentence.d
    if (difficulty === undefined) difficulty = 10
    let byLang = BY_DIFFICULTY[lang] || (BY_DIFFICULTY[lang] = {})
    let byDifficulty = byLang[difficulty] || (byLang[difficulty] = [])
    byDifficulty.push(sentence)
  }
}

var pick = function (language, difficulty) {
  console.log(language, difficulty)
  console.log(Object.keys(BY_DIFFICULTY[language]))
  let list = BY_DIFFICULTY[language][difficulty]
  return list[Math.floor(Math.random() * list.length)]
}

var difficultiesOfLanguage = function (language) {
  let k = Object.keys(BY_DIFFICULTY[language])
  k.sort((a, b) => {
    return parseInt(a) - parseInt(b)
  })
  return k
}

var available = function () {
  let out = []
  for (let lang of Object.keys(SENTENCES)) {
    if (SENTENCES[lang].length > 5) {
      out.push(lang)
    }
  }
  out.sort()
  return out
}

module.exports = {
  pick,
  difficultiesOfLanguage,
  available
}
