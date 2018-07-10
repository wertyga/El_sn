import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import axios from 'axios';

import classnames from 'classnames';

import './FlipMenu.sass';

const menuItems = [
    // {
    //     title: 'Download product',
    //     to: '/download'
    // },
    // {
    //     title: 'User cabinet',
    //     to: '/cabinet'
    // },
    // {
    //     title: 'Go to app',
    //     to: '/app/login'
    // },
    {
        title: 'Send request',
        to: '/request'
    },
    {
        title: 'Credentials',
        to: '/credentials'
    }
];

export default class FlipMenu extends React.Component {
    constructor(props) {
        super(props);
    };

    componentDidUpdate(prevProps) {
        if(this.props.showMenu !== prevProps.showMenu) {
            if(this.props.showMenu) {
                document.body.addEventListener('click', this.bodyEvents);
                window.addEventListener('keydown', this.bodyEvents);
            } else {
                document.body.removeEventListener('click', this.bodyEvents);
                window.removeEventListener('keydown', this.bodyEvents);
            };
        };
    };

    bodyEvents = e => {
        if(e.keyCode && e.keyCode === 27 || !e.keyCode) {
            if(!e.keyCode && e.target.classList.contains('circles') || e.target.parentElement.classList.contains('circles')) {
                return;
            }
            this.props.setShowMenu(false);
        }
    };

    render() {
        return (
            <ul className={classnames({ FlipMenu: true, open: this.props.showMenu })} ref={node => this.mainRef = node}>
                <li className="menu_item"
                    onClick={(e) => {
                        this.props.setShowMenu(false);
                        window.location.assign('app/login');
                    }}
                >
                    <div>Go to app</div>
                </li>
                {menuItems.map((item, i) => (
                        <li key={item.title}
                            style={{ transitionDelay: `${(i + 1) * 100}ms` }}
                            onClick={(e) => this.props.setShowMenu(false)}
                            className="menu_item"
                        >
                            <Link to={item.to}>{item.title}</Link>
                        </li>)
                )}
            </ul>
        );
    };
};

FlipMenu.propTypes = {
    showMenu: PropTypes.bool.isRequired, // Sign is the menu open
    setShowMenu: PropTypes.func.isRequired, // Close(or mb show) menu from children
};