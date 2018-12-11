module.exports = {
  devServer: {
    port: process.env.PORT || 5050,
    proxy: {
      '/api': {
        target: 'http://sonos-web-server:5051',
      },
    },
  },
};
