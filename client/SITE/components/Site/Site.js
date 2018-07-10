import { Switch, Route } from 'react-router-dom';

import UpperMenu from '../UpperMenu/UpperMenu';

import Request from '../Request/Request';
import Email from '../Email/Email';
import Credentials from '../Credentials/Credentials';
import Content from '../Content/Content';
import NotFoundPage from "../404/404";

import siteIcon from '../../../../icons/crypto_signer.png';

import './Site.sass';

class Site extends React.Component {
    constructor() {
        super();
    };

    componentDidMount() {
        const favicon = document.head.querySelector('link[rel="shortcut icon"]');
        favicon.setAttribute('href', siteIcon);
    };

    render() {
        return (
            <div className="Site">
                <div className="bg root">
                    <div className="main_color"></div>
                    <div className="dark_color"></div>
                </div>

                <UpperMenu />

                <Switch>
                    <Route exact path="/" component={Content}/>
                    <Route path="/request" component={Request}/>
                    <Route path='/email/unsubscribing/:userID/:emailCancelToken' component={Email}/>
                    <Route path='/credentials' component={Credentials}/>
                    <Route path='/*' component={NotFoundPage}/>
                </Switch>
            </div>
        );
    }
}

export default Site;

