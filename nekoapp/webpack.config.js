module.exports = {
  context: __dirname,
  entry: {
    'index.ios': ['./index.ios.js']
  },
  devtool: 'source-map',
  output: {
    path: __dirname + '/../game/src/main/resources/public/play/',
    filename: 'bundle.web.js',
    sourceMapFilename: 'bundle.web.map'
  },
  resolve: {
    alias: {
      'react-native': __dirname + '/node_modules/react-native-for-web/src'
    }
  },
  externals: [
    require(__dirname + '/node_modules/react-native-for-web/src/macro/image')
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-1'],
          plugins: [
            [
              'transform-runtime',
              {
                helpers: false,
                polyfill: false,
                regenerator: true
              }
            ],
            'transform-es2015-destructuring',
            'transform-object-rest-spread',
            'transform-async-to-generator'
          ]
        }
      }
    ]
  }
}
