import React, { Component } from 'react';
import {
	AsyncStorage,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	SafeAreaView,
	StatusBar
} from 'react-native';
const randomColor = require('randomcolor');
const Speech = Platform.OS === 'ios' ? require('react-native-speech') : undefined;
const jStat = require('jStat');

Array.prototype.randomElement = function() {
	return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.randomWithBeta = function(a, b) {
	let r = jStat.beta.sample(a, b);
	return this[Math.floor(r * this.length)];
};

const titles = [ 'Dragon', 'Royal Wyvern', 'Wyvern', 'Gryphon', 'Bear', 'Wolf', 'Dog', 'Cat' ].reverse();
const Sound = require('react-native-sound');

Sound.setCategory('Playback');

import SpriteSheet from 'rn-sprite-sheet';

var getSound = function(url, numberOfLoops) {
	let player = new Sound(url, Sound.MAIN_BUNDLE, (error) => {
		if (error) {
			console.log('failed to load the sound', error);
			return;
		}

		player.setNumberOfLoops(numberOfLoops);
		player.setVolume(0.7);
	});
	return player;
};

var coinSound = getSound('coin.wav', 0);
var funnySounds = [ getSound('happyrock.mp3', -1), getSound('cute.mp3', -1), getSound('jazzyfrenchy.mp3', -1) ];
let current = funnySounds[0];
let currentIndex = 1;
setTimeout(() => {
	current.play();
}, 1000);

class Elements {
	constructor(data, baseLevel = 0) {
		this.levels = [];
		let i = 0;
		for (let d of data) {
			d.level = baseLevel + Math.floor(i / 5);
			i++;
		}

		this.data = data;
	}

	pick = (level) => {
		let possible = [];
		for (let d of this.data) {
			if (d.level <= level) {
				possible.push(d);
			}
		}
		return possible.randomWithBeta(3, 1);
	};
}

var getColor = function(s, luminosity = 'dark', hue = 'blue') {
	return randomColor({ luminosity: luminosity, hue: hue, seed: s });
};

var hiragana = new Elements(require('./hiragana.json'));

class Hero extends Component {
	constructor(props) {
		super(props);
		this.state = {
			mode: 'a',
			score: 0
		};
	}

	levelUp = () => {
		let nextSong = funnySounds[currentIndex++ % funnySounds.length];
		current.stop();
		current = nextSong;
		current.play();
	};

	score = (amount) => {
		let s = this.state.score + amount;
		this.setState({ score: s });
		coinSound.play();
	};

	render() {
		return (
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: 10
				}}
			>
				<SpriteSheet
					ref={(ref) => (this.mummy = ref)}
					source={require('./hero/tommy_128.png')}
					columns={10}
					rows={6}
					width={64}
					imageStyle={{
						marginTop: -1
					}}
					animations={{
						a: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
						b: Array.from(
							{
								length: 10
							},
							(v, i) => i + 10
						),
						c: Array.from(
							{
								length: 10
							},
							(v, i) => i + 20
						),
						d: Array.from(
							{
								length: 10
							},
							(v, i) => i + 30
						),
						e: Array.from(
							{
								length: 10
							},
							(v, i) => i + 40
						),
						f: Array.from(
							{
								length: 7
							},
							(v, i) => i + 40
						)
					}}
				/>
				<Text
					style={{
						color: 'white',
						fontWeight: '500'
					}}
				>
					{titles[Math.min(Math.floor(this.props.level / 10), titles.length)]}, level: {this.props.level},
					score: {this.state.score}
				</Text>
			</View>
		);
	}

	componentDidMount() {
		this.play({ type: 'b', fps: 4, loop: true });

		this.timer = setInterval(() => {
			let type = [ 'a', 'b', 'c', 'd', 'e', 'f' ].randomElement();
			this.stop();
			this.play({ type: type, fps: 3, loop: true });
			this.setState({ mode: type });
		}, 5000);
	}
	play = (config) => this.mummy.play(config);
	stop = () => this.mummy.stop();
}

const fontSize = 30;
class Word extends Component {
	speak(text, lang = 'ja-JP') {
		if (!Speech || !current) return;

		current.pause();

		setTimeout(() => {
			return Speech.isSpeaking()
				.then((s) => {
					if (!s) {
						return Speech.speak({ text: text, voice: lang });
					}
				})
				.then(() => {
					setTimeout(() => current.play(), 500);
				})
				.catch((e) => {
					setTimeout(() => current.play(), 500);
				});
		}, 200);
	}

	_speak = () => {
		this.speak(this.props.word);
	};

	render() {
		return (
			<TouchableOpacity onPress={this.props.onPress} style={{ flex: 1 }} onLongPress={this._speak}>
				<Text
					style={{
						fontSize: fontSize,
						padding: 10,
						backgroundColor: getColor(this.props.word, 'light', 'green'),
						color: getColor('letter', 'dark', 'red')
					}}
				>
					{this.props.word}
				</Text>
			</TouchableOpacity>
		);
	}
}

class Row extends Component {
	constructor(props) {
		super(props);
		this.state = {
			clue: this.props.words.randomElement()
		};
	}

	_onPress = (e) => {
		if (e.character === this.state.clue.character) {
			this.props.onSuccess(e);
		} else {
			if (this.props.onFail) {
				this.props.onFail(e);
			}
		}
	};

	render() {
		return (
			<View
				style={{
					flexDirection: 'column',
					paddingTop: 40
				}}
			>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}
				>
					{this.props.words.map((e, i) => (
						<Word
							onPress={(x) => {
								this._onPress(e);
							}}
							key={e.character + '_' + i}
							word={e.character}
						/>
					))}
				</View>
				<Text
					style={{
						fontSize: fontSize,
						color: 'white',
						textAlign: 'center'
					}}
				>
					{this.state.clue.romanization}
				</Text>
			</View>
		);
	}
}
const numberOfItems = 5;
const difficultyInterval = 2000;
const limit = 5;

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rows: [],
			level: 0,
			success: 0
		};
		this.seen = {};
	}

	getRandomRow = (level) => {
		let out = [];
		for (let i = 0; i < numberOfItems; i++) {
			out.push(hiragana.pick(level));
		}
		let key = out.map((e) => e.character).join('_');
		if (!this.seen[key]) {
			this.seen[key] = true;
			return out;
		}

		return this.getRandomRow(level);
	};

	_storeLevel = (s) => {
		AsyncStorage.setItem('@neko:state', JSON.stringify(s));
	};

	_retrieveLevel = () => {
		return AsyncStorage.getItem('@neko:state')
			.then((value) => {
				if (value) {
					let decoded = JSON.parse(value);
					return decoded.level;
				}
				return 0;
			})
			.catch((err) => {
				console.log(err);
				return 0;
			});
	};

	componentWillMount() {
		this._retrieveLevel().then((level) => {
			this.setState(
				{
					level: level,
					rows: [ this.getRandomRow(level), this.getRandomRow(level), this.getRandomRow(level) ]
				},
				() => {
					this.retimer();
				}
			);
		});
	}
	addRow = () => {
		if (this.state.rows.length > limit) return;
		let copy = this.state.rows.slice();
		copy = [ this.getRandomRow(this.state.level) ].concat(copy);
		this.setState({ rows: copy });
	};

	_onSuccess = (idx) => {
		let copy = this.state.rows.slice();
		let s = this.state.success + 1;
		copy.splice(idx, 1);
		if (this.hero) {
			this.hero.score(1);
			if (s % 10 == 0) {
				let newLevel = this.state.level + 1;
				this.setState({ level: newLevel });
				this._storeLevel({ level: newLevel });

				this.hero.levelUp();
			}
		}

		this.setState({ rows: copy, success: s });
	};

	retimer = () => {
		clearInterval(this.timer);
		this.timer = setInterval(() => {
			this.addRow();
		}, this.getDuration());
	};

	getDuration = () => {
		return difficultyInterval;
	};

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	render() {
		return (
			<View
				style={{
					backgroundColor: getColor('bg', 'light'),
					flex: 1
				}}
			>
				<SafeAreaView style={styles.container}>
					<StatusBar hidden={true} />
					{this.state.rows.map((e, i) => (
						<Row
							onSuccess={() => {
								this._onSuccess(i);
							}}
							key={'_' + e.map((x) => x.character).join('_')}
							words={e}
						/>
					))}

					<Hero level={this.state.level} ref={(ref) => (this.hero = ref)} />
				</SafeAreaView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: 10,
		justifyContent: 'flex-end',
		flexDirection: 'column'
	}
});
