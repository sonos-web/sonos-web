const path = require('path'); // eslint-disable-line import/no-extraneous-dependencies

function resolveSrc(_path) {
  return path.join(__dirname, _path);
}
module.exports = {
  devServer: {
    port: process.env.PORT,
    host: process.env.HOST,
    proxy: {
      '/api': {
        target: 'http://localhost:5051',
      },
    },
  },
  configureWebpack: {
    devtool: 'source-map',
    // Set up all the aliases we use in our app.
    resolve: {
      alias: {
        '@': resolveSrc('src'),
      },
    },
  },
};
