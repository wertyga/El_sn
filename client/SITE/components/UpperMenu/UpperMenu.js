import { Link } from 'react-router-dom';

import classnames from 'classnames';

import FlipMenu from '../FlipMenu/FlipMenu';

import './UpperMenu.sass';

export default class UpperMenu extends React.Component {
    constructor() {
        super();

        this.state = {
            ping: false,
            showMenu: false
        };
    };

    componentDidMount() {
        this.pingInterval = setInterval(() => this.setState({ ping: !this.state.ping}), 600); // Blink right bar at <h1>
    };

    componentWillUnmount() {
        clearInterval(this.pingInterval); // Clear
        this.pingInterval = null;         // Interval
    };

    showMenu = () => { // Set show menu
        this.setState({ showMenu: !this.state.showMenu});
    };

    setShowMenu = sign => { // Set show menu from children
        this.setState({ showMenu: sign })
    };

    render() {
        return (
            <div className="UpperMenu">
                <Link to="/"><h1 className={classnames({ ping: this.state.ping})}>Crypto_signer</h1></Link>
                <div className={classnames({ circles: true, open: this.state.showMenu})} onClick={this.showMenu}>
                    <span></span><span></span><span></span>
                </div>

                <FlipMenu
                    showMenu={this.state.showMenu}
                    setShowMenu={this.setShowMenu}
                />
            </div>
        );
    };
};