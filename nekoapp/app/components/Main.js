import React, { Component } from 'react'
import {
  View,
  StatusBar,
  Animated,
  ScrollView,
  TextInput,
  TouchableHighlight
} from 'react-native'
import { Button, Text, Divider } from 'react-native-elements'
var Speech = require('react-native-speech')

const data = require('../data')

export default class Main extends Component {
  constructor (props) {
    super(props)
    this.state = {
      sentence: data.pick(),
      text: '',
      score: 0
    }
  }

  tokenize (s) {
    return s.toLowerCase().split(/\W+/).filter(e => {
      return e.length > 1
    })
  }

  evaluate () {
    let answer = {}
    let total = 0
    for (let s of this.tokenize(this.state.sentence.a)) {
      answer[s] = true
      total++
    }
    let score = 0
    for (let s of this.tokenize(this.state.text)) {
      if (answer[s]) {
        score++
      }
    }
    this.setState({ score: (score / total).toFixed(2) })
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

    return (
      <View style={{ flex: 1, padding: 40 }}>
        <ScrollView>
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <View>
              <Text h1 onPress={e => speak(sentence.q)}>
                {sentence.q}
              </Text>
            </View>
            <Divider style={{ backgroundColor: '#000', height: 40 }} />
            <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
              onChangeText={text => this.setState({ text })}
              value={this.state.text}
            />
            <Divider style={{ backgroundColor: '#000', height: 40 }} />
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}
            >
              <Button
                title="Check"
                style={{ paddingTop: 5 }}
                onPress={() => this.evaluate()}
              />

              <Button
                title={this.state.toggleDebug ? 'Hide Answer' : 'Show Answer'}
                style={{ paddingTop: 5 }}
                onPress={() => {
                  this.setState({ toggleDebug: !this.state.toggleDebug })
                }}
              />

              <Button
                title="Next"
                style={{ paddingTop: 5 }}
                onPress={() =>
                  this.setState({ sentence: data.pick(), text: '', score: 0 })}
              />

            </View>
            <Divider style={{ backgroundColor: '#000', height: 40 }} />
            <Text h8>
              score: {this.state.score}
            </Text>

            <Divider style={{ backgroundColor: '#000', height: 40 }} />
            <Text h8>
              {this.state.toggleDebug ? sentence.a : ''}
            </Text>
          </View>
        </ScrollView>
      </View>
    )
  }
}
