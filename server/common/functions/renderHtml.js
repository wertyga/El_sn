import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';

import configureStore from '../../../client/common/functions/configureStore';

export default (req, sign, Component, state) => {
    let store,
        html;
    if(sign !== 'site') {
        store = configureStore(state);
        html = renderToString(
            <StaticRouter context={{}} location={req.url}>
                <Provider store={store}>
                    {Component}
                </Provider>
            </StaticRouter>
        );
    } else {
        html = renderToString(
            <StaticRouter context={{}} location={req.url}>
                {Component}
            </StaticRouter>
        );
    };


    return (`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Crypto signer</title>
                <link rel="stylesheet" href="/css/main.css">
                <script>
                    window.__PRELOADED_STATE__ = ${sign !== 'site' ? JSON.stringify(store.getState()).replace(/</g, '\\u003c') : null}
                </script>
               <script src="/${sign}.js" defer></script>
            </head>
            <body>
            
                <div id="app">${html}</div>
            
            </body>
            </html>
        `);
};