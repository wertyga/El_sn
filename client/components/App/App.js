import { Switch, Route } from 'react-router-dom';

import routes from '../../common/routes';

class App extends React.Component {
    constructor(props) {
        super(props)
    };
    render() {
        return (
            <Switch>
                {routes.map((route, i) => <Route key={i} {...route}/>)}
                </Switch>
        );
    }
}

export default App;

