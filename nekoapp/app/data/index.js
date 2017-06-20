'use strict'

const SENTENCES = {
  ja: {
    advanced: require('./sentences/ja_advanced.json'),
    intermediate: require('./sentences/ja_intermediate.json'),
    beginner: require('./sentences/ja_beginner.json')
  },
  nl: {
    advanced: require('./sentences/nl_advanced.json'),
    intermediate: require('./sentences/nl_intermediate.json'),
    beginner: require('./sentences/nl_beginner.json')
  }
}

var pick = function (language, level) {
  let list = SENTENCES[language][level]
  return list[Math.floor(Math.random() * list.length)]
}

var available = function () {
  let out = []
  for (let lang in SENTENCES) {
    for (let level in SENTENCES[lang]) {
      let len = SENTENCES[lang][level].length
      if (len > 1) {
        out.push({ language: lang, level: level, len: len })
      }
    }
  }
  let sortedLevels = {
    beginner: 3,
    intermediate: 2,
    advanced: 1
  }
  out.sort((a, b) => {
    let diff = a.language.localeCompare(b.language)
    if (diff !== 0) return diff
    return sortedLevels[a.level] - sortedLevels[b.level]
  })
  return out
}

module.exports = {
  pick,
  available
}
