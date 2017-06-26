import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  AppState
} from 'react-native'
import Speak from './Speak'
const data = require('../data')
const { ts } = require('./textSizes')

export default class Local extends Component {
  constructor (props) {
    super(props)
    this.state = {
      initializing: true
    }
    data.load(this.props.language).then(() => {
      let s = this._pickNewSentence(this.props.language)
      this.setState({ initializing: false, ...s })
    })
  }

  componentDidMount () {
    if (Platform.OS !== 'browser')
      AppState.addEventListener('change', this._handleAppStateChange)
  }

  componentWillUnmount () {
    if (Platform.OS !== 'browser')
      AppState.removeEventListener('change', this._handleAppStateChange)
    data.save(this.props.language)
  }
  _handleAppStateChange = nextAppState => {
    if (nextAppState === 'background') {
      data.save(this.props.language)
    }
  }

  _pickNewSentence (language) {
    return {
      sentence: data.pick(language),
      score: 0,
      correct: [],
      showAnswer: false,
      text: ''
    }
  }

  resort () {
    this.setState({ spinner: true })
    setTimeout(() => {
      data.sortAndClassify(this.props.language)
      this.setState({ spinner: false })
      data.save(this.props.language)
    }, 0)
  }

  pickNewSentence (language, ev) {
    if (!ev) {
      ev = this.evaluate(this.state.sentence, this.state.text)
    }
    data.learn(this.props.language, ev.correct, ev.missing)
    this.setState(this._pickNewSentence(language))
    this.nSuccessfull += this.state.score
  }

  evaluate (sentence, text) {
    let answer = {}
    let total = 0
    let correct = []
    for (let s of data.tokenize(sentence.a)) {
      answer[s] = (answer[s] || 0) + 1
      total++
    }

    let score = 0
    for (let s of data.tokenize(text)) {
      let freq = answer[s]

      if (freq) {
        correct.push(s)

        if (--answer[s] === 0) {
          delete answer[s]
        }
        score++
      }
    }

    return {
      score: (score / total).toFixed(2),
      correct: correct,
      missing: Object.keys(answer)
    }
  }

  _handleTextChange = text => {
    let ev = this.evaluate(this.state.sentence, text)

    if (ev.score > 0.99) {
      this.pickNewSentence(this.props.language, ev)
    } else {
      this.setState({
        score: ev.score,
        correct: ev.correct,
        text: text,
        missing: ev.missing
      })
    }
  }

  spinner () {
    if (this.state.spinner) {
      return (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10
          }}
        >
          {Platform.OS !== 'browser' ? <ActivityIndicator /> : <View />}
          <Text style={ts.h10}>re-sorting the sentences based on new data</Text>
        </View>
      )
    }
  }

  render () {
    if (this.state.initializing) {
      return (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10
          }}
        >
          {Platform.OS !== 'browser' ? <ActivityIndicator /> : <View />}
          <Text style={ts.h10}>loading sentences..</Text>
        </View>
      )
    }
    let sentence = this.state.sentence
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          {this.spinner()}
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
              onChangeText={this._handleTextChange}
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
                <Text style={ts.h8}>
                  score: {this.state.score}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => this.resort()}
                >
                  <View>
                    <Text style={ts.h6}>re-sort (learn)</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => this.pickNewSentence(this.props.language)}
                >
                  <View>
                    <Text style={[ts.h6, { paddingLeft: 10 }]}>Next</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[ts.h10, { paddingTop: 20 }]}>
              {this.state.showAnswer
                ? 'positive: ' +
                    sentence.score_positive.toFixed(2) +
                    ', negative: ' +
                    sentence.score_negative.toFixed(2) +
                    ', sort score: ' +
                    sentence.score.toFixed(2)
                : ''}
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
