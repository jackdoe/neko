import React, { Component } from 'react'
import { View, TouchableOpacity, ScrollView, Text, Linking } from 'react-native'
import Local from './Local'
import Remote from './Remote'
const { ts } = require('./textSizes')

class EmptyScreen extends React.Component {
  render () {
    return <View />
  }
}
const data = require('../data')
class HelpScreen extends React.Component {
  render () {
    let toItems = function (title, items) {
      let mapped = items.map((e, i) => {
        return (
          <Text key={i}>
            * {e}
          </Text>
        )
      })

      return (
        <View>
          <Text style={ts.h4}>
            {title}
          </Text>
          <View style={{ height: 10 }} />
          {mapped}
          <View style={{ height: 10 }} />
        </View>
      )
    }

    let basic = [
      'type as many words as you can translate',
      'order does not  matter',
      'score is number-of-translated-words/total-words',
      'on iOS you can click on the text to hear text-to-speech'
    ]
    let multi = [
      'you have up to 1 minute to translate as much as you can',
      'new sentence is picked once someone translates 90% of the current sentence',
      'games are up to 5 players, when a game gets full a new one is created',
      'objective is to translate the sentence as fast as possible'
    ]
    let single = [
      'if you have given up you can click >Show< and see the translation of the current sentence',
      'click >Next< to go to the next random sentence',
      'click >join-a-game< to join a multi player game'
    ]

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
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
          {toItems('Basic Info', basic)}
          {toItems('Single Player', single)}
          {toItems('Multi Player', multi)}
        </ScrollView>
      </View>
    )
  }
}

class HomeScreen extends React.Component {
  constructor (props) {
    super(props)
    console.log(this.props.level, this.props.language)
    this.state = {
      level: this.props.level || 'beginner',
      language: this.props.language || 'ja'
    }
  }

  render () {
    const { navigate, persist } = this.props.navigation
    let available = data.available()
    let items = []
    let i = 0
    const lcMap = {
      ja: 'Japanese',
      nl: 'Dutch'
    }
    for (let item of available) {
      let { language, level, len } = item
      i++
      let title = lcMap[language] + ' / ' + level
      items.push(
        <TouchableOpacity
          key={i}
          activeOpacity={0.5}
          onPress={() => {
            this.setState({ language: language, level: level })
            persist({ language: language, level: level })
          }}
        >
          <Text style={[ts.h6, { padding: 5 }]}>
            {this.state.language === language && this.state.level === level
              ? '>' + title + '<'
              : title}
          </Text>
        </TouchableOpacity>
      )
    }

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff'
        }}
      >
        {items}
        <View style={{ height: 20 }} />
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            navigate('Local', {
              language: this.state.language,
              level: this.state.level
            })
          }}
        >
          <Text style={[ts.h4, { padding: 5 }]}>
            single player
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            navigate('Remote', {
              language: this.state.language,
              level: this.state.level
            })
          }}
        >
          <Text style={[ts.h4, { padding: 5 }]}>
            multi player
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            navigate('Help', {
              language: this.state.language,
              level: this.state.level
            })
          }}
        >
          <Text style={[ts.h4, { padding: 5 }]}>
            help?
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
}

export default class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      screens: {
        Home: { klass: HomeScreen, persist: {} },
        Local: { klass: Local, persist: {} },
        Remote: { klass: Remote, persist: {} },
        Help: { klass: HelpScreen, persist: {} }
      },
      _current: { screen: 'Home' }
    }
  }
  _navigate = (to, params) => {
    this.setState({
      _current: { screen: to, params: params },
      _prev: this.state._current.screen
    })
  }
  _persist = x => {
    let entry = this.state.screens[this.state._current.screen]
    entry.persist = { ...entry.persist, ...x }
  }

  render () {
    let entry = this.state.screens[this.state._current.screen]
    let Component = entry.klass
    let persisted = entry.persist
    let props = this.state._current.params

    let inner = (
      <Component
        navigation={{ navigate: this._navigate, persist: this._persist }}
        {...persisted}
        {...props}
      />
    )
    return (
      <View
        style={{
          padding: 20,
          flex: 1,
          paddingTop: 40
        }}
      >
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              this._navigate('Home')
            }}
          >
            <Text style={{ marginBottom: 10 }}>
              {this.state._current.screen === 'Home'
                ? 'ねこ　猫　cat'
                : '< ' + this.state._prev}
            </Text>
          </TouchableOpacity>
        </View>
        {inner}
      </View>
    )
  }
}
