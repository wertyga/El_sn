const styles = {
    close: {
        cursor: 'pointer',
        'text-align': 'right'
    }
};
const closeButton = document.querySelector('.close');
closeButton.onclick = close;
closeButton.addAttribute('style', Object.keys(styles.close).map(function(item) {
    return item + ': ' + styles[item] + ';'
}).join(' '));

module.exports = customize;