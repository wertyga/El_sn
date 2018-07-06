import { Route, Switch } from 'react-router-dom';

import routes from '../../common/routes';

import UpperMenu from '../UpperMenu/UpperMenu';
import Credentials from '../Credentials/Credentials';

import './App.sass';

class App extends React.Component {
    constructor() {
        super();

        this.state = {
            res: ''
        };
    };

    componentDidMount() {
        // document.body.style.width = window.innerWidth + 'px';
    };

    render() {
        return (
            <div className="App">
                <div className="bg">
                    <div className="main_color"></div>
                    <div className="dark_color">
                        {/*<div className="icon">*/}
                            {/*<img src={icon} alt="bg-icon"/>*/}
                            {/*<p>Crypto_signer</p>*/}
                        {/*</div>*/}
                    </div>


                </div>

                <UpperMenu />

                <Switch>
                    {routes.map((item, i) => <Route key={i} {...item}/>)}
                </Switch>

            </div>
        );
    }
}

export default App;

