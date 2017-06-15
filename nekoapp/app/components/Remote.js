import React, { Component } from 'react'

import { View, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import { Badge, Text, Divider } from 'react-native-elements'

var Speech = require('react-native-speech')
var randomColor = require('randomcolor')

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

    this.ws = new WebSocket('ws://10.156.62.53:4567/chat')

    this.ws.onopen = () => {
      this.lastReceived = new Date().getTime()
      clearInterval(this.pinger)
      this.ws.send('__ping__')
      this.pinger = setInterval(() => {
        this.ws.send('__ping__')
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
      if (e.data.startsWith('pong:')) {
        this.lastReceived = new Date().getTime()
        this.setState({
          timeLeft: parseInt(e.data.substring(e.data.indexOf(':') + 1))
        })
        return
      }

      let message = JSON.parse(e.data)
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
              <Text h4>Connection Error</Text>
              <Divider style={{ height: 20, backgroundColor: '#fff' }} />
              <Text h6>
                {this.state.error}
              </Text>
              <Divider style={{ height: 20, backgroundColor: '#fff' }} />
              <Text h6>
                click here to reconnect
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )
    }
  }
  renderTimer () {}
  renderUsers () {
    let users = this.state.message.game.state.map(e => {
      let words = Object.keys(e.matchingWords)
      words.sort()
      return (
        <View key={e.id} backgroundColor={this.colors[e.id]}>
          <Text h5>
            {e.id === this.state.message.you ? '「私」' : ''}
            {e.currentScore.toFixed(1)}
            {' '}
            {words.join(', ')}
          </Text>
          <Divider style={{ backgroundColor: '#fff', height: 5 }} />
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
            padding: 40,
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
            padding: 40,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text h6 onPress={() => this.reconnect()}>waiting...</Text>
        </View>
      )
    }

    let sentence = message.game.selectedSentence

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
      <View style={{ flex: 1 }}>
        <ScrollView>
          <View
            style={{
              justifyContent: 'center',
              padding: 40
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text h10>
                {this.state.timeLeft > 0
                  ? (this.state.timeLeft / 1000).toFixed(0) + ' seconds left'
                  : ''}
              </Text>
              <Divider style={{ backgroundColor: '#fff', height: 40 }} />
              <Text h4 onPress={e => speak(sentence.question)}>
                {sentence.question}
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
                this.setState({
                  text: text
                })
                this.ws.send(text)
              }}
              value={this.state.text}
            />
            <Divider style={{ backgroundColor: '#fff', height: 10 }} />
            {this.renderUsers()}
          </View>
        </ScrollView>
      </View>
    )
  }
}
