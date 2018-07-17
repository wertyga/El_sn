export const host = (path) => `http://localhost:3005${path}`;

global.host = host; // Localhost path
global.getToken = () => localStorage.getItem('token'); // Get localStorage token


