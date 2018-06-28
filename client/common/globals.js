global.toRound = function (obj, digital, addZeroes) { // .toFixed with "human face"
    if(isNaN(digital)) throw new Error('Argument must be a Number type');
    digital = Number(digital);
    let [first, last] = String(obj).replace(',', '.').split('.');
    if(!last) last = '';
    if(addZeroes && (last.length < digital)) {
        last += new Array(digital - last.length).fill('0').join('');
    } else {
        last = last.slice(0, digital);
    };

    return last ? String(`${first}.${last}`) : String(`${first}`);
};

export const host = (path) => `http://localhost:3005${path}`;

global.host = host; // Localhost path
global.getToken = () => localStorage.getItem('token'); // Get localStorage token


