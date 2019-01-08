import React, { Component, PureComponent } from 'react';
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
import SpriteSheet from 'rn-sprite-sheet';

const randomColor = require('randomcolor');
const Speech = Platform.OS === 'ios' ? require('react-native-speech') : undefined;
const jStat = require('jStat');
const fontSize = 25;
const titles = [ 'Dragon', 'Royal Wyvern', 'Wyvern', 'Gryphon', 'Bear', 'Wolf', 'Dog', 'Cat' ].reverse();
const Sound = require('react-native-sound');
const numberOfItems = 5;
const difficultyInterval = 1000;
const limit = 5;

Array.prototype.randomElement = function() {
	return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.randomWithBeta = function(a, b) {
	let r = jStat.beta.sample(a, b);
	return this[Math.floor(r * this.length)];
};

Sound.setCategory('Playback');

var getSound = function(url, numberOfLoops, volume = 0.3) {
	let player = new Sound(url, Sound.MAIN_BUNDLE, (error) => {
		if (error) {
			console.log('failed to load the sound', error);
			return;
		}

		player.setNumberOfLoops(numberOfLoops);
		player.setVolume(volume);
	});
	return player;
};

var coinSound = getSound('coin.wav', 0, 1.0);
var funnySounds = [ getSound('happyrock.mp3', -1), getSound('cute.mp3', -1), getSound('jazzyfrenchy.mp3', -1) ];
let current = funnySounds[0];
let currentIndex = 1;
setTimeout(() => {
	current.play();
}, 1000);

class Elements {
	constructor(sets) {
		this.setup(sets);
	}

	setup(sets) {
		this.levels = [];
		let data = [];
		let i = 0;
		for (let set of sets) {
			for (let d of set) {
				d.level = Math.floor(i / 5);
				i++;
				data.push(d);
			}
		}

		this.data = data;
	}

	getMaxLevel = () => {
		return this.data[this.data.length - 1].level;
	};

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

var hiragana = new Elements([ require('./hiragana.json'), require('./katakana.json'), require('./numbers.json') ]);

class Hero extends PureComponent {
	render() {
		return (
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
		);
	}

	componentDidMount = () => {
		this.play({ type: 'b', fps: 4, loop: true });
		this.heroTimer = setInterval(() => {
			let type = [ 'a', 'b', 'c', 'd', 'e', 'f' ].randomElement();
			this.stop();
			this.play({ type: type, fps: 3, loop: true });
		}, 5000);
	};

	componentWillUnmount = () => {
		clearInterval(this.heroTimer);
	};

	play = (config) => this.mummy.play(config);
	stop = () => this.mummy.stop();
}

class Word extends PureComponent {
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

class Row extends PureComponent {
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

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rows: [],
			level: 0,
			success: 0
		};
	}

	keyForRow(row) {
		return row.map((e) => e.character).join('_');
	}

	getRandomRow = (level) => {
		let out = [];
		for (let i = 0; i < numberOfItems; i++) {
			out.push(hiragana.pick(level));
		}
		let key = this.keyForRow(out);
		for (r of this.state.rows) {
			let other = this.keyForRow(r);

			if (key === other) return this.getRandomRow(level);
		}

		return out;
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

	componentDidMount() {
		this._retrieveLevel().then((level) => {
			this.forceLevel(level);
		});

		this.timer = setInterval(() => {
			this.addRow();
		}, difficultyInterval);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	addRow = () => {
		if (!this.state || this.state.rows.length > limit) return;

		let copy = [ this.getRandomRow(this.state.level) ];
		for (let r of this.state.rows) {
			copy.push(r);
		}

		this.setState({ rows: copy });
	};

	_onSuccess = (idx) => {
		let copy = this.state.rows.slice();
		let s = this.state.success + 1;
		copy.splice(idx, 1);

		coinSound.play();

		if (s % 10 == 0) {
			let newLevel = this.state.level + 1;
			this.setState({ level: newLevel });
			this._storeLevel({ level: newLevel });
			let nextSong = funnySounds[currentIndex++ % funnySounds.length];

			current.stop();
			current = nextSong;
			current.play();
		}

		this.setState({ rows: copy, success: s });
	};

	forceLevel = (level) => {
		if (level < 0) level = 0;

		this._storeLevel({ level: level });
		this.setState({
			level: level,
			rows: [ this.getRandomRow(level), this.getRandomRow(level), this.getRandomRow(level) ]
		});
	};

	render() {
		return (
			<View
				style={{
					backgroundColor: getColor('bg', 'light'),
					flex: 1
				}}
			>
				<SafeAreaView style={styles.container}>
					{this.state.rows.map((e, i) => (
						<Row
							onSuccess={() => {
								this._onSuccess(i);
							}}
							key={this.keyForRow(e)}
							words={e}
						/>
					))}
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
							padding: 10
						}}
					>
						<Hero />
						<TouchableOpacity
							onPress={() => {
								this.forceLevel(this.state.level + 1);
							}}
							onLongPress={() => {
								this.forceLevel(this.state.level - 1);
							}}
						>
							<Text
								style={{
									color: 'white'
								}}
							>
								{titles[Math.min(Math.floor(this.state.level / 10), titles.length - 1)]}, level:{' '}
								{this.state.level}, score: {this.state.success}
							</Text>
						</TouchableOpacity>
					</View>
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
