import React, { Component } from 'react'
import { Text, Platform } from 'react-native'

const { ts } = require('./textSizes')
var Speech = Platform.OS === 'ios' ? require('react-native-speech') : undefined

const mappedLanguageCodes = {
  ja: 'ja-JP',
  en: 'en-US',
  nl: 'nl-NL'
}
var iso639_to_rfc3306 = function (lang) {
  return mappedLanguageCodes[lang] || 'en-US'
}
export default class Speak extends Component {
  speak (text, lang) {
    if (!Speech) return

    return Speech.isSpeaking()
      .then(s => {
        if (!s) {
          return Speech.speak({
            text: text,
            voice: lang
          })
        }
      })
      .catch(e => {})
  }

  render () {
    return (
      <Text
        style={ts.h2}
        onPress={e =>
          this.speak(this.props.text, iso639_to_rfc3306(this.props.language))}
      >
        {this.props.text}
      </Text>
    )
  }
}
