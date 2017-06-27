import React, { Component } from 'react'

import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity
} from 'react-native'
import Speak from './Speak'

var randomColor = require('randomcolor')
const { ts } = require('./textSizes')

export default class Remote extends Component {
  constructor (props) {
    super(props)
    this.colors = {}
    this.state = {
      text: '',
      error: '',
      timeLeft: 0
    }
  }

  reconnect () {
    if (this.ws) {
      this.ws.close()
    }

    this.ws = new WebSocket('wss://neko.science/chat')

    this.ws.onopen = () => {
      this.lastReceived = new Date().getTime()
      clearInterval(this.pinger)

      try {
        this.ws.send(
          JSON.stringify({
            setting: { language: this.props.language }
          })
        )
      } catch (e) {}

      this.pinger = setInterval(() => {
        try {
          this.ws.send(JSON.stringify({ ping: true }))
        } catch (e) {}
        let now = new Date().getTime()
        // if it takes more than 10 seconds to receive a pong just disconnect
        if (now - this.lastReceived > 10000) {
          this.ws.close()
          this.setState({
            error: 'no ping/pong received in: ' +
              ((now - this.lastReceived) / 1000).toFixed() +
              ' seconds, disconnecting'
          })
          clearInterval(this.pinger)
        }
      }, 5000)
    }

    this.ws.onmessage = e => {
      let message = JSON.parse(e.data)
      if (message.pongSentAt) {
        this.lastReceived = new Date().getTime()
        this.setState({
          timeLeft: message.currentGameTimeLeft
        })
        return
      }

      if (message.type === 'SENTENCE_CHANGED') {
        this.setState({ text: '', timeLeft: 0 })
      }

      message.game.state.sort((a, b) => {
        let scoreDiff = b.currentScore - a.currentScore
        if (scoreDiff === 0) {
          return a.id - b.id
        }
        return scoreDiff
      })

      for (let userId of message.game.state.map(e => e.id)) {
        if (!this.colors[userId]) {
          this.colors[userId] = randomColor({ luminosity: 'light' })
        }
      }
      this.setState({
        message: message
      })
    }

    this.ws.onerror = e => {
      this.setState({ error: e.message })
    }

    this.ws.onclose = e => {}
  }

  componentDidMount () {
    this.reconnect()
  }

  componentWillUnmount () {
    clearInterval(this.pinger)
    this.ws.close()
  }

  renderError () {
    if (this.state.error) {
      return (
        <View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={e => {
              this.setState({ error: '', text: '' })
              this.reconnect()
            }}
          >
            <View>
              <Text style={ts.h4}>Connection Error</Text>
              <View style={{ height: 20 }} />
              <Text style={ts.h6}>
                {this.state.error}
              </Text>
              <View style={{ height: 20 }} />
              <Text style={ts.h6}>
                click here to reconnect
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )
    }
  }
  meSymbol () {
    return '웃 '
  }
  renderUsers () {
    let users = this.state.message.game.state.map(e => {
      let words = Object.keys(e.matchingWords)
      words.sort()
      return (
        <View key={e.id}>
          <View style={{ backgroundColor: this.colors[e.id] }}>
            <Text style={[ts.h8, { padding: 2 }]}>
              {e.id === this.state.message.you ? this.meSymbol() : ''}
              {e.currentScore.toFixed(1)}
              {' '}
              {words.join(', ')}
            </Text>
          </View>
          <View style={{ height: 5 }} />
        </View>
      )
    })
    return <View>{users}</View>
  }

  render () {
    if (this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {this.renderError()}
        </View>
      )
    }

    let message = this.state.message

    if (!message) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text style={ts.h6} onPress={() => this.reconnect()}>
            connecting...
          </Text>
        </View>
      )
    }

    let sentence = message.game.selectedSentence

    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <View style={{ alignItems: 'center' }}>
              <Text style={ts.h8}>
                {this.state.timeLeft > 0
                  ? (this.state.timeLeft / 1000).toFixed(0) + ' seconds left'
                  : '...'}
              </Text>
              <View style={{ height: 20 }} />
              <Speak text={sentence.question} language={this.state.language} />
            </View>
            <View style={{ height: 40 }} />
            <TextInput
              underlineColorAndroid="transparent"
              autoCorrect={false}
              autoFocus
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
                this.setState({
                  text: text
                })
                try {
                  this.ws.send(JSON.stringify({ value: text }))
                } catch (e) {}
              }}
              value={this.state.text}
            />
            <View style={{ height: 10 }} />
            {this.renderUsers()}
          </View>
        </ScrollView>
      </View>
    )
  }
}
