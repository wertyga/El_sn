import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import { BrowserRouter } from 'react-router-dom';

import './common/globals';

import './styles/index.sass';

import favicon from '../icons/crypto_signer.png';


const link = document.createElement('link');
link.setAttribute('rel', "shortcut icon");
link.setAttribute('href', favicon);
link.setAttribute('type', "image/png");
document.head.appendChild(link);

ReactDOM.render (
    <BrowserRouter>
        {/*<Provider store={store}>*/}
            <App />
        {/*</Provider>*/}
    </BrowserRouter>,
    document.getElementById('app')
);
