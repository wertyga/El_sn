import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import { BrowserRouter, StaticRouter } from 'react-router-dom';

import './common/globals';

import './styles/index.sass';

import favicon from '../icons/crypto_signer.png';


const link = document.createElement('link');
link.setAttribute('rel', "shortcut icon");
link.setAttribute('href', favicon);
link.setAttribute('type', "image/png");
document.head.appendChild(link);

ReactDOM.hydrate (
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('app')
);
