var fs = require('fs')
let out = []
for (let level of fs.readdirSync(process.argv[2])) {
  let path = process.argv[2] + '/' + level
  for (let file of fs.readdirSync(path)) {
    out = out.concat(JSON.parse(fs.readFileSync(path + '/' + file)))
  }
}
var tokenize = function (s) {
  return s.toLowerCase().split(/[\W]+/).filter(e => {
    return e.length > 0
  })
}
out = out.filter(e => {
  let maxLength = 20
  return (
    tokenize(e.q).length < maxLength &&
    tokenize(e.a).length < maxLength &&
    e.a.length > 0
  )
})
console.log(JSON.stringify(out, null, 2))
