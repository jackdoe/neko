import React, { Component } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
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
      <View style={{ flex: 1 }}>
        <View style={{ flex: 9, backgroundColor: '#fff' }}>
          {inner}
        </View>
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
              <Text>
                {this.state.multi ? 'single player' : 'join a game'}
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
      </View>
    )
  }
}
