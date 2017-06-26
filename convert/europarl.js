var LineByLine = require('n-readlines')

function shuffle (array) {
  let counter = array.length

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter)

    // Decrease counter by 1
    counter--

    // And swap the last element with it
    let temp = array[counter]
    array[counter] = array[index]
    array[index] = temp
  }

  return array
}

function lined (fn) {
  var liner = new LineByLine(fn)
  var out = []
  var line
  var lineNum = 0
  while ((line = liner.next())) {
    out.push({ line: line, n: lineNum++ })
  }
  return out
}

console.error(process.argv)

let original = shuffle(lined(process.argv[2]))
let translated = lined(process.argv[3])

let out = []
for (let i = 0; i < 5000; i++) {
  let o = original[i]
  out.push({
    q: o.line.toString('utf8'),
    a: translated[o.n].line.toString('utf8'),
    d: 10
  })
}
console.log(JSON.stringify(out, null, 2))
