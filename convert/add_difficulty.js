var fs = require('fs')
let sentences = JSON.parse(fs.readFileSync(process.argv[2]))
let difficulty = parseInt(process.argv[3])
for (let s of sentences) {
  s['d'] = difficulty
}

fs.writeFileSync(process.argv[2], JSON.stringify(sentences, null, 2))
