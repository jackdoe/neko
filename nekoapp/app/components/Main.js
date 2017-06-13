import React, { Component } from 'react'
import {
  View,
  StatusBar,
  Animated,
  ScrollView,
  TouchableHighlight
} from 'react-native'
import { Button, Text, Divider } from 'react-native-elements'
var Speech = require('react-native-speech')

const data = require('../data')

export default class Main extends Component {
  pick () {
    let picks = [data.pick(), data.pick(), data.pick(), data.pick()]

    return {
      picked: picks[Math.floor(Math.random() * picks.length)],
      picks: picks
    }
  }
  constructor (props) {
    super(props)
    this.state = {
      ...this.pick(),
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
      ...this.pick(),
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

        return (
          <Text
            h1
            key={i}
            onPress={e => {
              Speech.speak({
                text: text,
                voice: 'ja-JP'
              })
            }}
          >
            {text}
          </Text>
        )
      })
    }
    if (entry.R_ELE) {
      rele = entry.R_ELE.map((e, i) => {
        let text = e.REB.join(' , ')
        if (seen[text]) return
        return (
          <Text
            h3
            key={i}
            onPress={e => {
              Speech.speak({
                text: text,
                voice: 'ja-JP'
              })
            }}
          >
            {e.REB.join(' , ')}
          </Text>
        )
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
    //    shuffle(choices)
    let buttons = this.state.picks.map((e, i) => {
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
              <Text
                h8
                onPress={e => {
                  this.setState({ toggleDebug: !this.state.toggleDebug })
                }}
              >
                score:
                {(this.state.nCorrect / this.state.nShown).toFixed(2)}
              </Text>
            </View>
            <Text h8>
              {this.state.toggleDebug
                ? JSON.stringify(this.state.picked, null, 2)
                : ''}
            </Text>
          </View>
        </ScrollView>
      </View>
    )
  }
}
