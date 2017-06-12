import React, { Component } from 'react'
import { View } from 'react-native'
import { Button, Text } from 'react-native-elements'

const data = require('../data')
const shuffle = function (a) {
  var j, x, i
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i)
    x = a[i - 1]
    a[i - 1] = a[j]
    a[j] = x
  }
}

export default class Main extends Component {
  constructor (props) {
    super(props)
    this.state = {
      picked: data.pick()
    }
  }

  evaluate (choice) {
    let right = {}
    for (let r of this.state.picked.entries[0].SENSE[0].GLOSS) {
      right[r] = true
    }
    let correct = false
    for (let c of choice.entries[0].SENSE[0].GLOSS) {
      if (right[c]) {
        correct = true
      }
    }
    this.setState({ correct: correct })
    this.setState({ picked: data.pick() })
  }

  render () {
    let picked = this.state.picked
    let choices = [data.pick(), data.pick(), data.pick(), picked]
    let buttons = choices.map((e, i) => {
      let title = e.entries[0].SENSE[0].GLOSS.join(', ')

      return (
        <Button
          key={i}
          style={{ paddingTop: 5 }}
          title={title}
          onPress={() => this.evaluate(e)}
        />
      )
    })

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Text>{JSON.stringify(picked)}</Text>
          <Text>correct: {this.state.correct ? 'true' : 'false'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          {buttons}
        </View>
      </View>
    )
  }
}
