import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar
} from 'react-native';

/*

letters are falling in, like galaxy
we show which letter to be killed next, all other ones are indestructable
so you have to find it and attack it


[あ]　[ぢょ]　[れ]　[み]　[dyo]
    .
    .
    .
    .


if the letter reaches you, life--

next level can be with whole words such as 猫
*/
Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)]
}

var hiragana = require('./hiragana.json')
var katakana = require('./katakana.json')
var numbers = require('./numbers.json')

const fontSize = 20
class Word extends Component {
  render() {
    return <Text style={{
      fontSize: fontSize
    }} onPress={this.props.onPress}>{'[ '}{this.props.word}{' ]'}</Text>
  }
}
class Row extends Component {
  constructor(props) {
    super(props)
    this.state = {
      clue: this
        .props
        .words
        .randomElement()
    }
  }

  _onPress = (e) => {
    if (e.character === this.state.clue.character) {
      this
        .props
        .onSuccess(e)
    } else {
      if (this.props.onFail) {
        this
          .props
          .onFail(e)
      }
    }
  }
  render() {
    return <View style={{
      flexDirection: 'row'
    }}>
      {this
        .props
        .words
        .map((e, i) => <Word
          onPress={(x) => {
          this._onPress(e)
        }}
          key={e.character + "_" + i}
          word={e.character}/>)}
      <Text style={{
        flex: 1
      }}>{' '}</Text>
      <Text style={{
        fontSize: fontSize
      }}>{this.state.clue.romanization}</Text>
    </View>
  }
}

var getRandomRow = function (n) {
  let out = []
  for (let i = 0; i < n; i++) {
    out.push(hiragana.randomElement())
  }
  return out;
}

const numberOfItems = 5;
const difficultyInterval = 10000;
const limit = 300;

export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      rows: [
        getRandomRow(numberOfItems), getRandomRow(numberOfItems), getRandomRow(numberOfItems), getRandomRow(numberOfItems), getRandomRow(numberOfItems)
      ],
      success: 0
    }
  }

  addRow = () => {
    if (this.state.rows.length > limit) 
      return;
    let copy = this
      .state
      .rows
      .slice();
    copy = [getRandomRow(numberOfItems)].concat(copy)
    this.setState({rows: copy})
  }

  _onSuccess = (idx) => {
    let copy = this
      .state
      .rows
      .slice();

    copy.splice(idx, 1)

    this.setState({
      rows: copy,
      success: this.state.success + 1
    })
    this.retimer()
  }

  componentDidMount() {
    this.retimer()
  }

  retimer = () => {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.addRow();
    }, this.getDuration())
  }

  getDuration = () => {
    return difficultyInterval - (10 * this.state.success)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  render() {
    return (

      <SafeAreaView style={styles.container}>
        <StatusBar hidden={true}/>{this
          .state
          .rows
          .map((e, i) => <Row
            onSuccess={() => {
            this._onSuccess(i)
          }}
            key={"_" + e.map((x) => x.character).join("_")}
            words={e}/>)}
        <Text>score: {this.state.success}, blocks added every {this.getDuration() / 1000}
          {' '}seconds</Text>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 40,
    justifyContent: 'flex-end',
    flexDirection: 'column',
    backgroundColor: '#fff'
  }
});
