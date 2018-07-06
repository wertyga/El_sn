

import './AppTransition.sass'

export default class AppTransition extends React.Component {
    componentDidMount() {
        this.timer = setTimeout(() => location.assign('/app/login'), 1000);

    };

    componentWillUnmount() {
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