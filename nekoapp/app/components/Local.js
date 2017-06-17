import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity
} from 'react-native'
import Speak from './Speak'
const data = require('../data')
const { ts } = require('./textSizes')

export default class Local extends Component {
  constructor (props) {
    super(props)
    this.state = {
      sentence: data.pick(this.props.language, this.props.level),
      text: '',
      score: 0,
      correct: [],
      language: this.props.language,
      level: this.props.level
    }

    this.changeLanguage = lang => {
      this.setState({ language: lang })
      this.pickNewSentence(lang, this.state.level)
    }
    this.changeLevel = level => {
      this.setState({ level: level })
      this.pickNewSentence(this.state.language, level)
    }
  }

  pickNewSentence (language, level) {
    this.setState({
      sentence: data.pick(language, level),
      text: '',
      score: 0,
      correct: [],
      showAnswer: false
    })
  }

  tokenize (s) {
    return s.toLowerCase().split(/[\s"'_.,-]+/).filter(e => {
      return e.length > 0
    })
  }

  evaluate (sentence, text) {
    let answer = {}
    let total = 0
    let correct = []
    for (let s of this.tokenize(sentence.a)) {
      answer[s] = true
      total++
    }
    let score = 0
    for (let s of this.tokenize(text)) {
      if (answer[s]) {
        correct.push(s)
        score++
      }
    }
    return { score: (score / total).toFixed(2), correct: correct }
  }

  render () {
    let sentence = this.state.sentence
    let correct = this.state.correct.map((e, i) => {
      return <Text style={ts.h8} key={i}>{e}</Text>
    })
    return (
      <View style={{ flex: 1 }}>
        <ScrollView>
          <View
            style={{
              justifyContent: 'center',
              padding: 40
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Speak text={sentence.q} language={this.props.language} />
            </View>
            <View style={{ backgroundColor: '#fff', height: 40 }} />
            <TextInput
              autoCorrect={false}
              underlineColorAndroid="transparent"
              autoCapitalize="none"
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 0.5,
                paddingLeft: 10,
                paddingRight: 10
              }}
              onChangeText={text => {
                let ev = this.evaluate(sentence, text)
                if (ev.score > 0.99) {
                  this.pickNewSentence(this.state.language, this.state.level)
                } else {
                  this.setState({
                    text: text,
                    score: ev.score,
                    correct: ev.correct
                  })
                }
              }}
              value={this.state.text}
            />
            <View style={{ backgroundColor: '#fff', height: 10 }} />
            <View>{correct}</View>
            <View style={{ backgroundColor: '#fff', height: 10 }} />
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  this.setState({ showAnswer: !this.state.showAnswer })
                }}
              >
                <View>
                  <Text style={ts.h6}>
                    {this.state.showAnswer ? 'Hide' : 'Show'}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={ts.h8}>
                  score: {this.state.score}
                </Text>

              </View>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() =>
                  this.pickNewSentence(this.state.language, this.state.level)}
              >
                <View>
                  <Text style={ts.h6}>Next</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                backgroundColor: '#fff',
                height: 40
              }}
            />
            <Text style={ts.h8}>
              {this.state.showAnswer ? sentence.a : ''}
            </Text>
          </View>
        </ScrollView>
      </View>
    )
  }
}
