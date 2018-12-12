import io from 'socket.io-client';
import store from '../store';

const socket = io(process.env.VUE_APP_SERVER);

socket.on('AVTransport State Changed', (transportInfo) => {
  store.commit('SET_ZONE', transportInfo);
});
