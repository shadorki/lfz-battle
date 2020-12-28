const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devServer: {
    contentBase: path.join(__dirname, 'docs'),
    compress: true,
    port: 3000
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              "@babel/preset-typescript"
            ]
          }
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'docs'),
  },
  devtool: 'source-map'
};
