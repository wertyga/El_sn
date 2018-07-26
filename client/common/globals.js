export const host = (path) => `http://localhost:3005${path}`;

global.host = host; // host path
global.getToken = () => localStorage.getItem('token'); // Get localStorage token


