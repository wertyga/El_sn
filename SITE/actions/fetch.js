import axios from 'axios';

export const request = data => {
    return axios.post('/fetch/request', data)
};