import React, { Component } from 'react'
import { View, TouchableOpacity, Text, Linking } from 'react-native'
import Local from './Local'
import Remote from './Remote'
const { ts } = require('./textSizes')
export default class Main extends Component {
  constructor (props) {
    super(props)
    this.state = {
      multi: false,
      level: 'beginner',
      language: 'ja',
      help: false
    }
  }

  renderControls () {
    let levels = ['beginner', 'intermediate', 'advanced'].map((e, i) => {
      return (
        <TouchableOpacity
          key={i}
          activeOpacity={0.5}
          onPress={() => {
            this.setState({ level: e })
            this.refs.inner.changeLevel(e)
          }}
        >
          <Text style={{ paddingRight: 5 }}>
            {this.state.level === e ? '>' + e + '<' : e}
          </Text>
        </TouchableOpacity>
      )
    })

    let languages = ['ja', 'nl'].map((e, i) => {
      return (
        <TouchableOpacity
          key={i}
          activeOpacity={0.5}
          onPress={() => {
            this.setState({ language: e })
            this.refs.inner.changeLanguage(e)
          }}
        >
          <Text style={{ paddingRight: 5 }}>
            {this.state.language === e ? '>' + e + '<' : e}
          </Text>
        </TouchableOpacity>
      )
    })

    return (
      <View
        style={{
          backgroundColor: '#fff',
          flex: 2,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              this.setState({ multi: this.state.multi ? false : true })
            }}
          >
            <Text style={{ paddingRight: 5 }}>
              {this.state.multi ? 'single-player' : 'join-a-game'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              this.setState({ help: this.state.help ? false : true })
            }}
          >
            <Text style={{ paddingRight: 5 }}>
              {this.state.help ? 'hide-help✖' : 'help?'}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {levels}
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {languages}
        </View>
      </View>
    )
  }
  renderHelp () {
    if (!this.state.help) return
    let help = [
      'type as many words as you can translate',
      'order does not  matter',
      'score is number-of-translated-words/total-words',
      'change the difficulty or language by clicking on >advanced< and >ja< for example',
      'on iOS you can click on the text to hear text-to-speech'
    ]
    if (this.state.multi) {
      help.push(
        'in multi player game you have up to 1 minute to translate as much as you can'
      )
      help.push(
        'new sentence is picked once someone translates 90% of the current sentence'
      )
      help.push(
        'games are up to 5 players, when a game gets full a new one is created'
      )
      help.push('objective is to translate the sentence as fast as possible')
    } else {
      help.push(
        'if you have given up you can click >Show< and see the translation of the current sentence'
      )
      help.push('click >Next< to go to the next random sentence')
      help.push('click >join-a-game< to join a multi player game')
    }
    let text = help.map((e, i) => {
      return (
        <Text key={i}>
          * {e}
        </Text>
      )
    })
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40
        }}
      >
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            Linking.openURL('https://github.com/jackdoe/neko')
          }}
        >
          <View>
            <Text textDecorationLine="underline" style={{ color: 'navy' }}>
              want to contribute? go to https://github.com/jackdoe/neko and make a pull request :)
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{ height: 10 }} />
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            this.setState({ help: this.state.help ? false : true })
          }}
        >
          <View>
            {text}
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  render () {
    let inner = this.state.multi
      ? <Remote
          ref="inner"
          level={this.state.level}
          language={this.state.language}
        />
      : <Local
          ref="inner"
          level={this.state.level}
          language={this.state.language}
        />

    if (this.state.help) {
      return (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 9, backgroundColor: '#fff' }}>
            {this.renderHelp()}
          </View>
          {this.renderControls()}
        </View>
      )
    }
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 9, backgroundColor: '#fff' }}>
          {inner}
        </View>
        {this.renderControls()}
      </View>
    )
  }
}
