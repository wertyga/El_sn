import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import { Provider } from 'react-redux';
import { BrowserRouter, HashRouter } from 'react-router-dom';

import configureStore from './common/functions/configureStore';

import appIcon from '../icons/crypto_signer_app.png';

import './common/globals';

import './styles/index.sass';
import './styles/Fonts.sass';
import './styles/fontawesome-all.min.css';

process.env.NODE_ENV === 'production' && window.addEventListener('contextmenu', function(e) { e.preventDefault(); return false });

const store = configureStore();

// // #app creating
// let app = document.createElement('div');
// app.setAttribute('id', 'app');
// document.body.prepend(app);

// Favicon creating
const link = document.createElement('link');
link.setAttribute('rel', "shortcut icon");
link.setAttribute('href', appIcon);
link.setAttribute('type', "image/png");
document.head.appendChild(link);

ReactDOM.render (
    <BrowserRouter>
        <Provider store={store}>
            <App />
        </Provider>
    </BrowserRouter>,
    document.getElementById('app')
);
