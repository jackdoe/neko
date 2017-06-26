import React, { Component } from 'react'
import { Keyboard, StyleSheet, Animated, Platform } from 'react-native'

export default class KeyboardAware extends Component {
  constructor (props) {
    super(props)
    this.state = {
      keyboardOffset: new Animated.Value(0)
    }
  }

  _keyboardWillShow (e) {
    Animated.timing(this.state.keyboardOffset, {
      toValue: e.endCoordinates.height,
      duration: 200
    }).start(() => {
      if (this.props.onShowHide) {
        this.props.onShowHide()
      }
    })
  }

  _keyboardWillHide (e) {
    Animated.timing(this.state.keyboardOffset, {
      toValue: 0,
      duration: 200
    }).start(() => {
      if (this.props.onShowHide) {
        this.props.onShowHide()
      }
    })
  }

  componentWillMount () {
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      e => this._keyboardWillShow(e)
    )
    this.keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', e =>
      this._keyboardWillHide(e)
    )
  }

  componentWillUnmount () {
    if (this.keyboardDidShowListener) this.keyboardDidShowListener.remove()
    if (this.keyboardDidHideListener) this.keyboardDidHideListener.remove()
  }

  render () {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            marginBottom: this.state.keyboardOffset
          }
        ]}
      >
        {this.props.children}
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  }
})

KeyboardAware.propTypes = {
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object
  ]),
  onShowHide: React.PropTypes.func
}
