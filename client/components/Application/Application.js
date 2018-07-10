import { Switch, Route } from 'react-router-dom';

import LoginScreen from '../../components/LogInScreen/LogInScreen';
import SignupPage from '../../components/SignupPage/SignupPage';
import NotFoundApp from '../../components/404/404';
import SocketWrapper from '../../components/SocketWrapper/SocketWrapper';

import appIcon from '../../../icons/crypto_signer_app.png';

import './Application.sass';

class Application extends React.Component {
    constructor(props) {
        super(props)
    };

    componentDidMount() {
        const favicon = document.head.querySelector('link[rel="shortcut icon"]');
        favicon.setAttribute('href', appIcon);
    };

    render() {
        return (
           <div className="Application">
               <Switch>
                   <Route path="/app/login" component={LoginScreen}/>
                   <Route path="/app/sign-up" component={SignupPage}/>
                   <Route path='/app/user/:id' component={SocketWrapper}/>
                   <Route path='/app/*' component={NotFoundApp}/>
               </Switch>
           </div>
        );
    }
}

export default Application;