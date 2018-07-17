export const host = (path) => `http://46.101.209.10:3005${path}`;

global.host = host; // Localhost path
global.getToken = () => localStorage.getItem('token'); // Get localStorage token


