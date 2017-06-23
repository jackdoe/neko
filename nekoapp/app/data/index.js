'use strict'
import { AsyncStorage, Platform } from 'react-native'
var BayesClassifier = require('bayes-classifier')

const SENTENCES = {
  ja: require('./sentences/ja.json')
}
const POSITIVE = 'p'
const NEGATIVE = 'n'
var CLASSIFIERS = {}
var CURSOR = {}

var m_w = +new Date()
var m_z = 987654321
var mask = 0xffffffff

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
        this.classifier.restore(state.classifier)
        return true
      })
    }
    return Promise.resolve(true)
  }

  learn (document, klass) {
    this.classifier.addDocument(document, klass)
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
  return s.toLowerCase().split(/[\s"'_.,-\\?]+/).filter(e => {
    return e.length > 0
  })
}
var timed = function (title, cb) {
  let t0 = +new Date()

  cb()

  console.log(title + ' took', +new Date() - t0)
}

var reclassify = function (sentences, classifier) {
  timed('reclassify', function () {
    for (let s of sentences) {
      s.classification = classifier.classify(s.a)
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
    }
  })
}

var learn = function (lang, correct, missing) {
  let c = CLASSIFIERS[lang]
  if (correct.length > 0) c.learn(correct.join(' '), POSITIVE)
  if (missing.length > 0) c.learn(missing.join(' '), NEGATIVE)
}

var resort = function (lang) {
  CURSOR[lang] = 0
  SENTENCES[lang].sort((a, b) => {
    let aScore =
      Math.abs(0.7 - a.score_positive) +
      (0.1 - 0.1 * a.d) +
      random() * 0.01 -
      a.score_negative / 2

    let bScore =
      Math.abs(0.7 - b.score_positive) +
      (0.1 - 0.1 * b.d) +
      random() * 0.01 -
      b.score_negative / 2
    return bScore - aScore
  })
}

var sortAndClassify = function (lang) {
  let classifier = CLASSIFIERS[lang]
  reclassify(SENTENCES[lang], classifier)
  resort(lang)
}

var pick = function (lang) {
  let s = SENTENCES[lang]
  return s[CURSOR[lang]++ % s.length]
}

var save = function () {
  for (let k in CLASSIFIERS) {
    CLASSIFIERS[k].save()
  }
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

// XXX: PREPROCESS
var init = function () {
  for (let lang in SENTENCES) {
    CURSOR[lang] = 0
    let sentences = SENTENCES[lang]
    let classifier = (CLASSIFIERS[lang] = new StoredClassifier({ name: lang }))
    classifier.load().then(() => {
      reclassify(sentences, classifier)
      resort(lang)
    })
  }
}

init()

module.exports = {
  pick,
  learn,
  save,
  sortAndClassify,
  tokenize,
  available
}
