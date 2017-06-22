var fs = require('fs')
let out = []
for (let level of fs.readdirSync(process.argv[2])) {
  let path = process.argv[2] + '/' + level
  for (let file of fs.readdirSync(path)) {
    out = out.concat(JSON.parse(fs.readFileSync(path + '/' + file)))
  }
}
console.log(JSON.stringify(out, null, 2))
