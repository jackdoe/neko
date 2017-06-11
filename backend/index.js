const express = require('express')
const app = express()
const zlib = require('zlib'), fs = require('fs'), path = require('path')

Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)]
}

const ROOT = JSON.parse(
  zlib.unzipSync(fs.readFileSync(path.join(__dirname, 'edict.json.gz')))
)

const DICT = ROOT.JMDICT.ENTRY

var pick = function () {
  return DICT[Math.floor(Math.random() * DICT.length)]
}
app.get('/pick/:id', function (req, res) {
  res.json(pick())
})

var port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('listening on port ' + port)
})
