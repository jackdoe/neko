import { AsyncStorage, Platform } from 'react-native'

var reinforce = require('reinforcenode')

export default class Network {
  constructor (params) {
    let { name, inputs } = params
    this.name = name
    this.inputs = inputs
    let env = {
      getNumStates: function () {
        return inputs.length
      },
      getMaxNumActions: function () {
        return inputs.length
      }
    }
    let spec = { alpha: 0.01 }
    this.agent = new reinforce.DQNAgent(env, spec)
    if (Platform.OS !== 'browser') {
      AsyncStorage.getItem(name).then(data => {
        if (!data) return
        let state = JSON.parse(data)
        this.agent.fromJSON(state.net)
      })
    }
  }

  learn (reward) {
    this.agent.learn(reward)
  }

  act () {
    return this.inputs[this.agent.act(this.inputs)]
  }

  save () {
    if (Platform.OS !== 'browser') {
      AsyncStorage.setItem(
        this.name,
        JSON.stringify({
          name: this.name,
          inputs: this.inputs,
          net: this.agent.toJSON()
        })
      )
    }
  }
}
