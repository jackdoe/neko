'use strict;'
const path = require('path')

var migrate_xml_edict_to_json = function (src, dst) {
  var zlib = require('zlib'),
    fs = require('fs'),
    xml2js = require('xml2js'),
    parser = new xml2js.Parser({ strict: false })

  parser.parseString(zlib.unzipSync(fs.readFileSync(src)), function (
    err,
    result
  ) {
    if (err) {
      console.error(err)
    } else {
      fs.writeFileSync(
        dst + '.gz',
        zlib.gzipSync(JSON.stringify(result, null, 2), {
          level: zlib.constants.Z_BEST_COMPRESSION
        })
      )
    }
  })
}

migrate_xml_edict_to_json(
  path.join(__dirname, 'JMdict_e.gz'),
  path.join(__dirname, 'edict.raw.json')
)
