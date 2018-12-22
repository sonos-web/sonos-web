import axios from 'axios';

export default function (baseURL) {
  return axios.create({
    baseURL,
  });
}
