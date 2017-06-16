import React, { Component } from 'react'
import {
  View,
  StatusBar,
  Animated,
  ScrollView,
  TextInput,
  TouchableOpacity,
  AppRegistry
} from 'react-native'
import { Button, Text, Divider } from 'react-native-elements'
import Local from './Local'
import Remote from './Remote'
export default class Main extends Component {
  constructor (props) {
    super(props)
    this.state = { multi: false, level: 'beginner', language: 'ja' }
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
          <Text> {this.state.level === e ? '>' + e + '<' : e}</Text>
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
          <Text> {this.state.language === e ? '>' + e + '<' : e}</Text>
        </TouchableOpacity>
      )
    })

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 10, backgroundColor: '#fff' }}>
          {inner}
        </View>
        <View
          style={{
            backgroundColor: '#fff',
            flex: 1,
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
            <Text>{this.state.multi ? 'single player' : 'join a game'}</Text>
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-around'
            }}
          >
            {levels}
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-around'
            }}
          >
            {languages}
          </View>

        </View>
      </View>
    )
  }
}
