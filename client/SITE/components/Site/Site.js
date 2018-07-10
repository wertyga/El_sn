import UpperMenu from '../UpperMenu/UpperMenu';

import './Site.sass';

class Site extends React.Component {
    constructor() {
        super();
    };

    render() {
        return (
            <div className="Site">
                <div className="bg root">
                    <div className="main_color"></div>
                    <div className="dark_color"></div>
                </div>

                <UpperMenu />

                {this.props.children}
            </div>
        );
    }
}

export default Site;

