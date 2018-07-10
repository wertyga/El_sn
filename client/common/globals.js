import setAxiosErrors from './functions/setAxiosErrors';

export const host = (path) => path;

global.setError = setAxiosErrors;
global.host = host; // Localhost path
global.notified = [];
global.getToken = () => localStorage.getItem('token'); // Get localStorage token


