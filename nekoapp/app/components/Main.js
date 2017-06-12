import React, { Component } from 'react'
import {
  View,
  StatusBar,
  Animated,
  ScrollView,
  TouchableHighlight
} from 'react-native'
import { Button, Text, Divider } from 'react-native-elements'

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
      picked: data.pick(),
      initial: true,
      nShown: 1,
      nCorrect: 0
    }
  }

  evaluate (choice) {
    let right = {}
    for (let r of this.state.picked.SENSE[0].GLOSS) {
      right[r] = true
    }
    let correct = false
    for (let c of choice.SENSE[0].GLOSS) {
      if (right[c]) {
        correct = true
      }
    }
    this.setState({
      correct: correct,
      prevPicked: this.state.picked,
      picked: data.pick(),
      initial: false,
      nShown: this.state.nShown + 1,
      nCorrect: correct ? this.state.nCorrect + 1 : this.state.nCorrect
    })
  }
  renderEntry (entry, gloss, style) {
    let kele = undefined, rele = undefined, g = undefined, seen = {}

    if (entry.K_ELE) {
      kele = entry.K_ELE.map((e, i) => {
        let text = e.KEB.join(' , ')
        if (seen[text]) return
        seen[text] = true

        return <Text h1 key={i}>{text}</Text>
      })
    }
    if (entry.R_ELE) {
      rele = entry.R_ELE.map((e, i) => {
        let text = e.REB.join(' , ')
        if (seen[text]) return
        return <Text h3 key={i}>{e.REB.join(' , ')}</Text>
      })
    }

    if (gloss) {
      g = <Text h7>{entry.SENSE[0].GLOSS.join(', ')}</Text>
    }
    return (
      <View
        style={{ alignItems: 'center', justifyContent: 'center', ...style }}
      >
        {kele}
        <Divider style={{ height: 30 }} />
        {rele}
        <Divider style={{ height: 30 }} />
        {g}
      </View>
    )
  }
  render () {
    let picked = this.state.picked
    let choices = [data.pick(), data.pick(), data.pick(), picked]
    //    shuffle(choices)
    let buttons = choices.map((e, i) => {
      let title = e.SENSE[0].GLOSS.join(', ')

      return (
        <Button
          key={i}
          title={title}
          style={{ paddingTop: 5 }}
          onPress={() => this.evaluate(e)}
        />
      )
    })

    if (!this.state.initial && !this.state.correct) {
      return (
        <View style={{ flex: 1, padding: 40 }}>
          <TouchableHighlight
            onPress={e => {
              this.setState({ correct: true })
            }}
          >
            {this.renderEntry(this.state.prevPicked, true, {
              backgroundColor: 'powderblue'
            })}
          </TouchableHighlight>
        </View>
      )
    }

    return (
      <View style={{ flex: 1, padding: 40 }}>
        <ScrollView>
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <View>
              {this.renderEntry(this.state.picked)}
            </View>
            <Divider style={{ backgroundColor: '#000' }} />
            <View>
              {buttons}
            </View>
            <Divider style={{ backgroundColor: '#000', height: 40 }} />
            <View>
              <Text h8>
                score: {(this.state.nCorrect / this.state.nShown).toFixed(2)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}
