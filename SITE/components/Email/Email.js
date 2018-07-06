import axios from 'axios';

import './Email.sass';

export default class Email extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            unsubscribing: false,
            errors: ''
        };
    };

    componentDidMount() {
        const { userID, emailCancelToken } = this.props.match.params;
        return axios.post(`/email/unsubscribing/${userID}/${emailCancelToken}`)
            .then(res => this.setState({ unsubscribing: true }))
            .catch(err => this.setState({ errors : err.response ? err.response.data.errors : err.message }))
    };
    render() {
        return (
            <div className="Email">
                <h2>Subscribing</h2>
                {this.state.errors && <div className="error">{this.state.errors}</div>}
                {this.state.unsubscribing && <p>Unsubscribe success</p>}
            </div>
        );
    };
};