'use strict'
import {AsyncStorage, Platform} from 'react-native'
import AdventureTurtle from 'adventureturtle-client';
var timed = function (title, cb) {
  let t0 = +new Date()

  cb()

  console.log(title + ' took', + new Date() - t0)
}

var storeLocally = async function (k, v) {
  return await AsyncStorage.setItem(k, v)
}

var loadLocally = async function (k) {
  return await AsyncStorage.getItem(k);
}

var tokenize = function (s) {
  return s
    .toLowerCase()
    .split(/\s+/)
    .filter(e => {
      return e.length > 0
    })
}

function shuffle(array) {
  let counter = array.length;

  while (counter > 0) {
    let index = Math.floor(Math.random() * counter);
    counter--;
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

const getRandom = function (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const LOADED = {
  ja: require('./sentences/ja.json'),
  nl: require('./sentences/nl.json'),
  de: require('./sentences/de.json'),
  fi: require('./sentences/fi.json'),
  it: require('./sentences/it.json'),
  es: require('./sentences/es.json'),
  fr: require('./sentences/fr.json')
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x'
        ? r
        : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class Sentences {
  constructor(lang) {
    this.sentences = LOADED[lang];
    shuffle(this.sentences);

    this.turtle = new AdventureTurtle({apiKey: '03d59831-423f-403c-b307-9a515330f84e', loadFunction: loadLocally, storeFunction: storeLocally});

    var randomWords = [];
    let i = 0;
    for (let s of this.sentences) {
      s.tokenized_answer = s.tokenized_answer || tokenize(s.a)
      if (i++ < 500) {
        randomWords = randomWords.concat(s.tokenized_answer)
      }
    }
    for (var s of this.sentences) {
      s.features = s.tokenized_answer;
      s.random_answer = []
      for (let i = 0; i < Math.min(s.tokenized_answer.length, 5) && i < 10; i++) {
        s
          .random_answer
          .push(getRandom(randomWords))
      }
    }
    this.onlySort()
    this.cursor = 0;
  }

  getUserContext() {
    return {
      features: [
        "uuid=" + this.uuid,
        "os=" + Platform.OS,
        "version=" + Platform.Version,
        "hour=" + new Date().getHours()
      ]
    };
  }

  initialize = () => {
    return AsyncStorage
      .getItem('uuid')
      .then((data) => {
        if (data) {
          this.uuid = data
        } else {
          u = uuidv4();
          this.uuid = u;
          return AsyncStorage.setItem('uuid', u)
        }
      })
  }

  onlySort = () => {
    shuffle(this.sentences);
    this.sentences = this
      .turtle
      .scoreInplace(this.sentences, this.getUserContext());

    for (var s of this.sentences) {
      s.score += Math.random() * 0.001;
    }

    this.sentences = this
      .sentences
      .sort((a, b) => {
        return (b.score - 0.5) - (a.score - 0.5)
      });
  }
  sort = () => {
    return this
      .turtle
      .downloadModel()
      .then(this.onlySort)
  }

  track = (correct, missing) => {
    this
      .turtle
      .track([
        {
          features: missing
        }
      ], this.getUserContext(), false);
    this
      .turtle
      .track([
        {
          features: correct
        }
      ], this.getUserContext(), true);
  }

  pick() {
    return this.sentences[this.cursor++ % this.sentences.length];
  }
}
var available = function () {
  return Object.keys(LOADED)
}
module.exports = {
  Sentences,
  available,
  shuffle
}