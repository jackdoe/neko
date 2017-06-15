import React, { Component } from 'react'
import { Platform } from 'react-native'

import { Text } from 'react-native-elements'
var Speech = Platform.OS === 'ios' ? require('react-native-speech') : undefined

export default class Speak extends Component {
  speak (text) {
    if (!Speech) return

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

  render () {
    return (
      <Text h4 onPress={e => this.speak(this.props.text)}>
        {this.props.text}
      </Text>
    )
  }
}
