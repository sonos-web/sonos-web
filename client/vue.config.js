module.exports = {
  devServer: {
    port: process.env.PORT,
    proxy: {
      '/api': {
        target: 'http://sonos-web-server:5051',
      },
    },
  },
};
