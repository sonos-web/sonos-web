module.exports = {
  css: {
    modules: true,
  },
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
  },
};
