import React, { Component } from 'react'
import { Text, View, StatusBar } from 'react-native'
const data = require('../data')

export default class Main extends Component {
  render () {
    return <Text>{JSON.stringify(data.pick())}</Text>
  }
}
