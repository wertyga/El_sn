import { Route, Switch } from 'react-router-dom';

import routes from '../../common/routes';

import UpperMenu from '../UpperMenu/UpperMenu';

import './App.sass';

class App extends React.Component {
    constructor(props) {
        super(props);
    };

    componentDidMount() {
        // document.body.style.width = window.innerWidth + 'px';
    };

    render() {
        return (
            <div className="App">
                <div className="bg root">
                    <div className="main_color"></div>
                    <div className="dark_color"></div>
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

