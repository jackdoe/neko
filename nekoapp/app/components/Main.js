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
    this.state = { multi: false }
  }
  render () {
    let inner = this.state.multi ? <Remote /> : <Local />
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 10 }}>
          {inner}
        </View>
        <View
          style={{
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
        </View>
      </View>
    )
  }
}
