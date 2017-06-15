import React, { Component } from 'react'
import { View, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import { Text, Divider } from 'react-native-elements'
var Speech = require('react-native-speech')

const data = require('../data')

export default class Local extends Component {
  constructor (props) {
    super(props)
    this.state = {
      sentence: data.pick(),
      text: '',
      score: 0,
      correct: []
    }
  }

  tokenize (s) {
    return s.toLowerCase().split(/[\s"'_\.-]+/).filter(e => {
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
    let speak = function (text) {
      return Speech.isSpeaking()
        .then(s => {
          if (!s) {
            return Speech.speak({
              text: text,
              voice: 'ja-JP'
            })
          }
        })
        .catch(e => {})
    }
    let correct = this.state.correct.map((e, i) => {
      return <Text h8 key={i}>{e}</Text>
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
              <Text h4 onPress={e => speak(sentence.q)}>
                {sentence.q}
              </Text>
            </View>
            <Divider style={{ backgroundColor: '#fff', height: 40 }} />
            <TextInput
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
                this.setState({
                  text: text,
                  score: ev.score,
                  correct: ev.correct
                })
              }}
              value={this.state.text}
            />
            <Divider style={{ backgroundColor: '#fff', height: 10 }} />
            <View>{correct}</View>
            <Divider style={{ backgroundColor: '#fff', height: 10 }} />
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
                  <Text h4>{this.state.showAnswer ? 'Hide' : 'Show'}</Text>
                </View>
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text h8>
                  score: {this.state.score}
                </Text>

              </View>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() =>
                  this.setState({
                    sentence: data.pick(),
                    text: '',
                    score: 0,
                    correct: [],
                    showAnswer: false
                  })}
              >
                <View>
                  <Text h4>Next</Text>
                </View>
              </TouchableOpacity>
            </View>
            <Divider style={{ backgroundColor: '#fff', height: 40 }} />

            <Divider style={{ backgroundColor: '#fff', height: 40 }} />
            <Text h8>
              {this.state.showAnswer ? sentence.a : ''}
            </Text>
          </View>
        </ScrollView>
      </View>
    )
  }
}
