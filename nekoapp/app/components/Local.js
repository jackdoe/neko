import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  AppState
} from 'react-native'
import Speak from './Speak'
import Network from '../data/net'
const data = require('../data')
const { ts } = require('./textSizes')

let networks = {}
export default class Local extends Component {
  constructor (props) {
    super(props)
    let { language } = this.props

    this.net =
      networks[language] ||
      (networks[language] = new Network({
        name: language,
        inputs: data.difficultiesOfLanguage(language)
      }))
    this.state = this._pickNewSentence(language)
  }

  componentDidMount () {
    if (Platform.OS !== 'browse')
      AppState.addEventListener('change', this._handleAppStateChange)
  }

  componentWillUnmount () {
    if (Platform.OS !== 'browse')
      AppState.removeEventListener('change', this._handleAppStateChange)
    this.save()
  }
  _handleAppStateChange = nextAppState => {
    if (nextAppState === 'background') {
      this.save()
    }
  }
  save () {
    for (let k in networks) {
      networks[k].save()
    }
  }
  _pickNewSentence (language) {
    return {
      sentence: data.pick(language, this.net.act()),
      text: '',
      score: 0,
      correct: [],
      showAnswer: false
    }
  }

  pickNewSentence (language) {
    // try to achive 70%
    let score = this.evaluate(this.state.sentence, this.state.text).score
    let reward = Math.random() * 0.1
    if (score < 0.7) {
      reward += 0.1 + score
    }

    this.net.learn(reward)

    this.setState(this._pickNewSentence(language))
  }

  tokenize (s) {
    return s.toLowerCase().split(/[\s"'_.,-\\?]+/).filter(e => {
      return e.length > 0
    })
  }

  evaluate (sentence, text) {
    let answer = {}
    let total = 0
    let correct = []
    for (let s of this.tokenize(sentence.a)) {
      answer[s] = (answer[s] || 0) + 1
      total++
    }

    let score = 0
    for (let s of this.tokenize(text)) {
      let freq = answer[s]

      if (freq > 0) {
        correct.push(s)
        answer[s]--
        score++
      }
    }
    return { score: (score / total).toFixed(2), correct: correct }
  }

  render () {
    let sentence = this.state.sentence
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <View style={{ alignItems: 'center' }}>
              <Speak text={sentence.q} language={this.props.language} />
            </View>
            <View style={{ height: 40 }} />
            <TextInput
              autoCorrect={false}
              underlineColorAndroid="transparent"
              autoCapitalize="none"
              placeholder="translate as many words as you can.."
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
                  this.pickNewSentence(this.props.language)
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
            <View style={{ height: 10 }} />
            <Text style={ts.h8}>{this.state.correct.join(', ')}</Text>
            <View style={{ height: 10 }} />
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <View style={{ flex: 1 }}>
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
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={ts.h6}>
                  score: {this.state.score}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => this.pickNewSentence(this.props.language)}
                >
                  <View>
                    <Text style={ts.h6}>Next</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={ts.h8}>
              {this.state.showAnswer ? 'difficulty: ' + sentence.d : ''}
            </Text>

            <Text style={[ts.h8, { paddingTop: 20 }]}>
              {this.state.showAnswer ? sentence.a : ''}
            </Text>

          </View>
        </ScrollView>
      </View>
    )
  }
}
