let hiragana = {}

const add = function (r, h) {
  hiragana[r] = h
}

// taken from https://github.com/SirCmpwn/hiragana.js

add('a', 'あ')
add('i', 'い')
add('u', 'う')
add('e', 'え')
add('o', 'お')
add('ka', 'か')
add('ki', 'き')
add('ku', 'く')
add('ke', 'け')
add('ko', 'こ')
add('sa', 'さ')
add('shi', 'し')
add('su', 'す')
add('se', 'せ')
add('so', 'そ')
add('ta', 'た')
add('chi', 'ち')
add('tsu', 'つ')
add('te', 'て')
add('to', 'と')
add('na', 'な')
add('ni', 'に')
add('nu', 'ぬ')
add('ne', 'ね')
add('no', 'の')
add('ha', 'は')
add('hi', 'ひ')
add('fu', 'ふ')
add('he', 'へ')
add('ho', 'ほ')
add('ma', 'ま')
add('mi', 'み')
add('mu', 'む')
add('me', 'め')
add('mo', 'も')
add('ya', 'や')
add('yu', 'ゆ')
add('yo', 'よ')
add('ra', 'ら')
add('ri', 'り')
add('ru', 'る')
add('re', 'れ')
add('ro', 'ろ')
add('wa', 'わ')
add('wo', 'を')
add('ga', 'が')
add('gi', 'ぎ')
add('gu', 'ぐ')
add('ge', 'げ')
add('go', 'ご')
add('za', 'ざ')
add('ji', 'じ')
add('zu', 'ず')
add('ze', 'ぜ')
add('zo', 'ぞ')
add('da', 'だ')
add('de', 'で')
add('do', 'ど')
add('ba', 'ば')
add('bi', 'び')
add('bu', 'ぶ')
add('be', 'べ')
add('bo', 'ぼ')
add('pa', 'ぱ')
add('pi', 'ぴ')
add('pu', 'ぷ')
add('pe', 'ぺ')
add('po', 'ぽ')
add('kya', 'きゃ')
add('kyu', 'きゅ')
add('kyo', 'きょ')
add('sha', 'しゃ')
add('shu', 'しゅ')
add('sho', 'しょ')
add('cha', 'ちゃ')
add('chu', 'ちゅ')
add('cho', 'ちょ')
add('nya', 'にゃ')
add('nyu', 'にゅ')
add('nyo', 'にょ')
add('hya', 'ひゃ')
add('hyu', 'ひゅ')
add('hyo', 'ひょ')
add('mya', 'みゃ')
add('myu', 'みゅ')
add('myo', 'みょ')
add('rya', 'りゃ')
add('ryu', 'りゅ')
add('ryo', 'りょ')
add('gya', 'ぎゃ')
add('gyu', 'ぎゅ')
add('gyo', 'ぎょ')
add('ja', 'じゃ')
add('ju', 'じゅ')
add('jo', 'じょ')
add('bya', 'びゃ')
add('byu', 'びゅ')
add('byo', 'びょ')
add('pya', 'ぴゃ')
add('pyu', 'ぴゅ')
add('pyo', 'ぴょ')

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)]
}
function getRandomArbitrary (min, max) {
  return Math.random() * (max - min) + min
}

let sentences = []
let keys = Object.keys(hiragana)

let pick = function (n) {
  let question = []
  let answer = []

  for (let i = 0; i < n; i++) {
    let key = keys.random()
    question.push(hiragana[key])
    answer.push(key)
  }

  return {
    q: question.join('、 ') + '。',
    a: answer.join(', ') + '.'
  }
}

for (let i = 0; i < 200; i++) {
  sentences.push(pick(getRandomArbitrary(5, 20)))
}

console.log(JSON.stringify(sentences, null, 2))
