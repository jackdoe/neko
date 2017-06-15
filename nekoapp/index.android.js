import React, { Component } from 'react'
import Main from './app/components/Main'

import { AppRegistry } from 'react-native'

export default class neko extends Component {
  render () {
    return <Main />
  }
}
AppRegistry.registerComponent('neko', () => neko)
