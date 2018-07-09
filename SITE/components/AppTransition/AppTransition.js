

import './AppTransition.sass'

export default class AppTransition extends React.Component {
    componentDidMount() {
        document.getElementsByClassName('bg')[0].classList.add('root');
        this.timer = setTimeout(() => location.assign('/app/login'), 1000);

    };

    componentWillUnmount() {
        document.getElementsByClassName('bg')[0].classList.remove('root');
        clearTimeout(this.timer);
        this.timer = null;
    };

    render() {
        return (
            <div className="AppTransition">
                <h2>Entering application...</h2>
            </div>
        );
    };
};