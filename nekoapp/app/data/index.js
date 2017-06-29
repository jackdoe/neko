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

var m_w = +new Date()
var m_z = 987654321
var mask = 0xffffffff
var SEEN = {}

function random () {
  m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask
  m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask
  var result = ((m_z << 16) + m_w) & mask
  result /= 4294967296
  return result + 0.5
}

class StoredClassifier {
  constructor (params) {
    this.name = params.name
    this.classifier = new BayesClassifier()
  }
  load () {
    if (Platform.OS !== 'browser') {
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
    }
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
    if (Platform.OS !== 'browser') {
      AsyncStorage.setItem(
        this.name,
        JSON.stringify({
          name: this.name,
          classifier: this.classifier
        })
      )
    }
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

var reclassify = function (sentences, classifier) {
  for (let s of sentences) {
    s.a_tokenized = s.tokenized_answer || (s.tokenized_answer = tokenize(s.a))
    s.classification = classifier.classify(s.tokenized_answer)
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
    s.score =
      Math.abs(
        s.score_positive < 0.5 ? s.score_positive : 0.5 - s.score_positive
      ) +
      (0.01 - 0.01 * s.d) +
      random() * 0.01 -
      0.3 * (s.score_negative / 2)
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
  save,
  sortAndClassify,
  tokenize,
  available
}
