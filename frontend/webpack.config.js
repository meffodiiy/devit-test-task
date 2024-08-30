const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')


require('dotenv').config({ path: './.env' })
const { BE_PORT, FE_HOST, FE_PORT } = process.env


module.exports = {
  mode: 'development',
  entry: './frontend/entry.tsx',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader'
        }
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader:'css-loader',
            options: {
              modules: {
                exportLocalsConvention: 'camelCase'
              }
            }
          }
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './frontend/public/index.html',
      inject: 'body'
    })
  ],
  devServer: {
    host: FE_HOST,
    port: FE_PORT,
    historyApiFallback: true,
    proxy: [
      {
        context: ['/**'],
        target: `http://localhost:${BE_PORT}`
      }
    ]
  }
}
