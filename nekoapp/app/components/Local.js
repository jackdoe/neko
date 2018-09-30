import React, {Component} from 'react'
import {
  Text,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  FlatList,
  StyleSheet,
  AppState
} from 'react-native'
import Speak from './Speak'
import {Sentences, shuffle} from '../data'
const {ts} = require('./textSizes')

export default class Local extends Component {
  constructor(props) {
    super(props)
    this.sentences = new Sentences(this.props.language);
    this.state = {
      initializing: true
    }
  }

  componentWillMount() {
    this
      .sentences
      .initialize()
      .then(this.sentences.onlySort)
      .then(() => {
        let s = this._pickNewSentence()
        this.setState({
          initializing: false,
          ...s
        })
      })
  }

  _pickNewSentence() {
    let sentence = this
      .sentences
      .pick();

    let answer = {}
    for (let word of sentence.tokenized_answer) {
      answer[word] = (answer[word] || 0) + 1
    }
    let words = [].concat(sentence.tokenized_answer, sentence.random_answer)

    shuffle(words)

    return {
      sentence: sentence,
      answer: answer,
      score: 0,
      showAnswer: false,
      selectedWords: {},
      words: words
    }
  }

  resort() {
    this.setState({spinner: true})
    this
      .sentences
      .sort()
      .then(() => {
        this.setState({spinner: false})
        this.pickNewSentence()
      })
  }

  evaluate() {
    let sentence = this.state.sentence
    let missing = []
    let correct = []
    for (let word of sentence.tokenized_answer) {
      if (this.state.selectedWords[word]) {
        correct.push(word)
      } else {
        missing.push(word)
      }
    }
    return {correct: correct, missing: missing}
  }

  pickNewSentence() {
    let score = this.evaluate()

    setTimeout(() => {
      this
        .sentences
        .track(score.correct, score.missing)
    },0)


    this.setState(this._pickNewSentence())
  }

  renderWord = ({item, index}) => {
    let word = item
    let backgroundColor = '#F1FAEE'
    let textColor = '#1D3557'
    if (this.state.selectedWords[word]) {
      textColor = '#fff'
      if (this.state.answer[word]) {
        backgroundColor = '#457B9D'
      } else {
        backgroundColor = '#e63946'
      }
    }
    return (
      <View style={{
        padding: 2
      }}>
        <TouchableOpacity
          style={{
          backgroundColor: backgroundColor
        }}
          onPress={() => {
          let current = Object.assign({}, this.state.selectedWords);
          current[word] = true;
          this.setState({selectedWords: current})
        }}>
          <Text
            style={{
            fontSize: 20,
            padding: 10,
            textAlign: 'center',
            color: textColor
          }}>
            {word}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
  renderWords() {
    let sentence = this.state.sentence
    let answer = {}
    let total = 0

    for (let s of sentence.tokenized_answer) {
      answer[s] = (answer[s] || 0) + 1
    }

    return (<FlatList
      keyExtractor={(item, index) => index}
      contentContainerStyle={{
      justifyContent: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap'
    }}
      data={this.state.words}
      renderItem={this.renderWord}/>)
  }

  spinner() {
    if (this.state.spinner) {
      return (
        <View
          style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10
        }}>
          <ActivityIndicator/>
          <Text style={ts.h10}>re-sorting the sentences based on new data</Text>
        </View>
      )
    }
  }

  render() {
    if (this.state.initializing) {
      return (
        <View
          style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10
        }}>
          <ActivityIndicator/>
          <Text style={ts.h10}>loading sentences..</Text>
        </View>
      )
    }

    let sentence = this.state.sentence
    let score = this.evaluate()
    let nextColor = '#457B9D'
    if (score.missing.length === 0) {
      nextColor = '#E63946'
    }
    return (
      <View style={{
        flex: 1
      }}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          {this.spinner()}
          <View>
            <View style={{
              height: 40
            }}/>
            <View style={{
              alignItems: 'center'
            }}>
              <Speak text={sentence.q} language={this.props.language}/>
            </View>
            <View style={{
              height: 40
            }}/>{this.renderWords()}

            <View style={{
              height: 40
            }}/>

            <View
              style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}>
              <TouchableOpacity
                style={{
                flex: 1,
                justifyContent: 'center',
                backgroundColor: '#457B9D',
                margin: 5
              }}
                activeOpacity={0.5}
                onPress={() => {
                this.setState({
                  showAnswer: !this.state.showAnswer
                })
              }}>
                <Text
                  style={[
                  ts.h6, {
                    textAlign: 'center',
                    color: '#fff',
                    padding: 5
                  }
                ]}>
                  {this.state.showAnswer
                    ? 'Hide'
                    : 'Show'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                flex: 1,
                justifyContent: 'center',
                backgroundColor: '#A8DADC',
                margin: 5
              }}
                activeOpacity={0.5}
                onPress={() => this.resort()}>

                <Text
                  style={[
                  ts.h6, {
                    textAlign: 'center',
                    color: '#0c0c0c',
                    padding: 5
                  }
                ]}>
                  re-sort (learn)
                </Text>

              </TouchableOpacity>
              <TouchableOpacity
                style={{
                flex: 1,
                backgroundColor: nextColor,
                margin: 5,
                justifyContent: 'center'
              }}
                activeOpacity={0.5}
                onPress={() => this.pickNewSentence(this.props.language)}>
                <Text
                  style={[
                  ts.h6, {
                    textAlign: 'center',
                    color: '#fff',
                    padding: 5
                  }
                ]}>
                  Next
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              style={[
              ts.h8, {
                paddingTop: 20
              }
            ]}>
              {this.state.showAnswer
                ? sentence.a
                : ''}
            </Text>
            <Text
              style={[
              ts.h8, {
                paddingTop: 20
              }
            ]}>
              {this.state.showAnswer
                ? 'score: ' + sentence.score
                : ''}
            </Text>
          </View>
        </ScrollView>
      </View>
    )
  }
}
