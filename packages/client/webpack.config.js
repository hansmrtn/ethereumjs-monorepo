const { resolve } = require('path')

module.exports = {
  mode: 'production',
  entry: './dist.browser/browser/index.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'file-replace-loader',
        options: {
          condition: 'always',
          replacement(resourcePath) {
            const mapping = {
              [resolve('./dist.browser/lib/logging.js')]: resolve(
                './dist.browser/browser/logging.js'
              ),
              [resolve('./dist.browser/lib/net/peer/libp2pnode.js')]: resolve(
                './dist.browser/browser/libp2pnode.js'
              ),
            }
            return mapping[resourcePath]
          },
          async: true,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  output: {
    filename: 'bundle.js',
    path: resolve(__dirname, 'dist'),
    library: 'ethereumjs',
  },
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'), // used by: rlpxpeer, bin/cli.ts
      dgram: false, // used by: rlpxpeer via @ethereumjs/devp2p
      fs: false, // used by: FullSynchronizer via @ethereumjs/vm
      net: false, // used by: rlpxpeer
      os: require.resolve('os-browserify/browser'), // used by: bin/cli.ts, web3_clientVersion rpc
      path: false, // used by: bin/cli.ts
      stream: require.resolve('stream-browserify'), // used by: fetcher
    },
  },
  performance: {
    hints: false, // suppress maxAssetSize warnings etc..
  },
  externals: ['dns'],
}
