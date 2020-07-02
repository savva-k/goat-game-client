const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const fs = require("fs");
const appDirectory = fs.realpathSync(process.cwd());
const resolveAppPath = relativePath => path.resolve(appDirectory, relativePath);
const phaser = resolveAppPath("/node_modules/phaser/dist/phaser.js");


module.exports = {
  mode: "development",
  entry: ['@babel/polyfill', resolveAppPath("./src/App.ts")],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }]
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }
      },
      {
        test: /\.(png|jpg|jpeg|svg|gif)$/,
        use: ['file-loader']
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
          },
        }],
      }
      // { test: /\.ts$/, use: ["ts-loader"], exclude: "/node_modules" },
      // { test: /phaser\.js$/, use: ["expose-loader?Phaser"] },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: resolveAppPath('./index.html'),
    }),
  ],
  devServer: {
    contentBase: resolveAppPath("."),
    publicPath: "/dist/",
    host: "0.0.0.0",
    port: 8080,
    open: true,
    compress: true,
    hot: true,
    publicPath: "/"
  },
  resolve: {
    alias: {
      phaser: phaser
    },
    modules: [resolveAppPath("/src"), "/node_modules"],
    descriptionFiles: ["package.json"],
    extensions: [".js", ".ts", ".d.ts", ".jsx", ".tsx", ".json"],
  },
};
