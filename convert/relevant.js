const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

const ROOT = JSON.parse(
  zlib.unzipSync(fs.readFileSync(path.join(__dirname, 'edict.raw.json.gz')))
)
const WORDS = JSON.parse(
  zlib.unzipSync(fs.readFileSync(path.join(__dirname, 'words.json.gz')))
)

var convert = function (dict) {
  let out = {}
  for (let entry of dict) {
    for (let sense of entry.SENSE) {
      let gloss = sense.GLOSS
      for (let g of gloss) {
        let glossToEntry = out.g || (out[g] = [])
        glossToEntry.push(entry)
      }
    }
  }
  return out
}

let out = []
let dict = convert(ROOT.JMDICT.ENTRY)
for (let w of WORDS) {
  let entries = dict[w.word]
  if (entries) {
    out.push({
      word: w.word,
      score: parseFloat(w.freq),
      entries: entries
    })
  }
}

fs.writeFileSync(
  path.join(__dirname, '..', 'nekoapp', 'app', 'data', 'edict.json'),
  JSON.stringify(out)
)
