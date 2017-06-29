var LineByLine = require('n-readlines')

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

let difficulty = parseInt(process.argv[3])
let out = []
for (let l of lined(process.argv[2])) {
  let splitted = l.line.toString('utf8').split('\t')
  let popped = splitted.pop()
  if (popped !== 'general') {
    splitted.push(popped)
    throw JSON.stringify(splitted)
  }
  out.push({
    q: splitted[0] + '。\n' + splitted[1].replace(/・/g, '、'),
    a: splitted[2],
    d: difficulty
  })
}
console.log(JSON.stringify(out, null, 2))
