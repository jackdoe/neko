import React, { Component } from 'react'

import { View, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import { Badge, Text, Divider } from 'react-native-elements'

import Speak from './Speak'
var randomColor = require('randomcolor')

export default class Remote extends Component {
  constructor (props) {
    super(props)
    this.colors = {}
    this.state = {
      text: '',
      error: '',
      timeLeft: 0,
      language: this.props.language,
      level: this.props.level
    }

    this.changeLanguage = lang => {
      this.setState({ language: lang })
      this.changeSetting(lang, this.state.level)
    }
    this.changeLevel = level => {
      this.setState({ level: level })
      this.changeSetting(this.state.language, level)
    }
    this.changeSetting = (language, level) => {
      try {
        this.ws.send(
          JSON.stringify({
            setting: { language: language, level: level }
          })
        )
      } catch (e) {}
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
      this.changeSetting(this.state.language, this.state.level)
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
          <Text h6 onPress={() => this.reconnect()}>connecting...</Text>
        </View>
      )
    }

    let sentence = message.game.selectedSentence

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
              <Speak text={sentence.question} language={this.state.language} />
            </View>
            <Divider style={{ backgroundColor: '#fff', height: 40 }} />
            <TextInput
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
                this.setState({
                  text: text
                })
                try {
                  this.ws.send(text)
                } catch (e) {}
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
