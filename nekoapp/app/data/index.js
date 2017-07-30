'use strict'
import { AsyncStorage, Platform } from 'react-native'
var BayesClassifier = require('bayes-classifier')

const SENTENCES = {
  ja: require('./sentences/ja.json'),
  nl: require('./sentences/nl.json'),
  de: require('./sentences/de.json'),
  fi: require('./sentences/fi.json'),
  it: require('./sentences/it.json'),
  es: require('./sentences/es.json'),
  fr: require('./sentences/fr.json')
}

const POSITIVE = 'p'
const NEGATIVE = 'n'
var CLASSIFIERS = {}
var CURSOR = {}
var SEEN = {}

const shuffle = function (array) {
  let counter = array.length

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter)

    // Decrease counter by 1
    counter--

    // And swap the last element with it
    let temp = array[counter]
    array[counter] = array[index]
    array[index] = temp
  }

  return array
}

class StoredClassifier {
  constructor (params) {
    this.name = params.name
    this.classifier = new BayesClassifier()
  }
  load () {
    return AsyncStorage.getItem(this.name).then(data => {
      if (!data) return
      let state = JSON.parse(data)
      try {
        this.classifier.restore(state.classifier)
      } catch (e) {
        this.classifier = new BayesClassifier()
      }
      return true
    })

    return Promise.resolve(true)
  }

  learn (document, klass) {
    this.classifier.addDocument(tokenize(document), klass)
    this.classifier.train()
  }

  classify (document) {
    return this.classifier.getClassifications(document)
  }

  save () {
    AsyncStorage.setItem(
      this.name,
      JSON.stringify({
        name: this.name,
        classifier: this.classifier
      })
    )
  }
}

var tokenize = function (s) {
  return s.toLowerCase().split(/[\W]+/).filter(e => {
    return e.length > 0
  })
}

var timed = function (title, cb) {
  let t0 = +new Date()

  cb()

  console.log(title + ' took', +new Date() - t0)
}
const getRandom = function (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
var reclassify = function (sentences, classifier) {
  let randomWords = []
  shuffle(sentences)
  let i = 0
  for (let s of sentences) {
    s.tokenized_answer = s.tokenized_answer || tokenize(s.a)
    if (i++ < 500) {
      randomWords = randomWords.concat(s.tokenized_answer)
    }
  }

  for (let s of sentences) {
    s.classification = classifier.classify(s.tokenized_answer)
    s.random_answer = []
    for (let i = 0; i < Math.min(s.tokenized_answer.length, 5) && i < 10; i++) {
      s.random_answer.push(getRandom(randomWords))
    }
    s.score_positive = 0
    s.score_negative = 0

    if (s.classification.length > 0) {
      for (let v of s.classification) {
        if (v.label === POSITIVE) {
          s.score_positive = v.value
        } else {
          s.score_negative = v.value
        }
      }
    }
    s.score = s.score_positive - s.score_negative / 2 + Math.random()
  }
}

var learn = function (lang, correct, missing) {
  let c = CLASSIFIERS[lang]
  if (correct.length > 0) c.learn(correct.join(' '), POSITIVE)
  if (missing.length > 0) c.learn(missing.join(' '), NEGATIVE)
}

var resort = function (lang) {
  CURSOR[lang] = 0
  SENTENCES[lang].sort((a, b) => {
    return b.score - a.score
  })
}

var sortAndClassify = function (lang) {
  let classifier = CLASSIFIERS[lang]
  reclassify(SENTENCES[lang], classifier)
  resort(lang)
}

var pick = function (lang) {
  let s = SENTENCES[lang]
  for (let i = 0; i < 100; i++) {
    let sentence = s[CURSOR[lang]++ % s.length]
    if (!SEEN[sentence.q]) {
      SEEN[sentence.q] = true
      return sentence
    }
  }
  return s[CURSOR[lang]++ % s.length]
}

var save = function (lang) {
  CLASSIFIERS[lang].save()
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

var load = function (lang) {
  CURSOR[lang] = 0
  let classifier = (CLASSIFIERS[lang] = new StoredClassifier({ name: lang }))
  return classifier.load().then(() => {
    sortAndClassify(lang)
  })
}

module.exports = {
  pick,
  load,
  learn,
  shuffle,
  getRandom,
  save,
  sortAndClassify,
  tokenize,
  available
}
