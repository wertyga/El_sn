import { request } from '../../actions/fetch';

import validateInput from '../../../server/common/functions/inputsValidation';

import Loading from '../common/Loading/Loading';
import Transition from '../common/Transition/Transition';

import './Request.sass';

class Request extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            message: '',
            wasSend: false,
            loading: false,
            showModal: false,
            errors: {}
        };
    };

    componentDidMount() {
        const bg = document.getElementsByClassName('bg')[0];
        if(bg) bg.classList.remove('root');
    };

    onSubmit = e => {
        e.preventDefault();

        const checkObj = { email: { field: this.state.email, require: true }, message: { field: this.state.message, require: true } };
        const { errors, isValid } = validateInput(checkObj);
        if(!isValid) {
            this.setState({ errors });
        } else {
            this.setState({ loading: true });
            request(checkObj)
                .then(res => {
                    this.setState({ loading: false, email: '', message: '', showModal: true });
                })
                .catch(err => this.setState({
                    errors: setError(err),
                    loading: false
                }))
        };
    };

    onChange = e => {
        this.setState({
            [e.target.name]: e.target.value,
            errors: { ...this.state.errors, [e.target.name]: '', globalError: '' }
        });
    };

    render() {

        const modal = (
            <div className="modal">
                <p>Your request has been send</p>
                <button className="btn primary" onClick={() => this.setState({ showModal: false })}>ok</button>
            </div>
        );
        const enterModal = {
            from: { opacity: 0, transform: 'translate(-50%, -150%)'},
            to: { opacity: 1, transform: 'translate(-50%, -100%)'},
        };
        const leaveModal = {
            from: enterModal.from,
            to: enterModal.from
        };

        return (
            <div className="Request">
                <h2>Send request</h2>

                <Loading show={this.state.loading}/>

                <Transition
                    show={this.state.showModal}
                    enter={enterModal}
                    leave={leaveModal}
                >
                    {modal}
                </Transition>
                <form onSubmit={this.onSubmit} className="content">
                    {this.state.errors.globalError && <div className="error">{this.state.errors.globalError}</div>}


                    <label htmlFor="email_request"><strong>E-mail:</strong></label>
                    <input type="text"
                           name="email"
                           value={this.state.email}
                           onChange={this.onChange}
                           id="email_request"
                           disabled={this.state.loading || this.state.showModal}
                    />
                    {this.state.errors.email && <div className="error">{this.state.errors.email}</div>}

                    <label htmlFor="message_request"><strong>Type your request here:</strong></label>
                    <textarea
                        name="message"
                        value={this.state.message}
                        onChange={this.onChange}
                        id="message_request"
                        disabled={this.state.loading || this.state.showModal}
                    />
                    {this.state.errors.message && <div className="error">{this.state.errors.message}</div>}

                    <button className="btn primary" type="submit" disabled={this.state.loading || this.state.showModal}>Send request</button>
                </form>
            </div>
        );
    };
};

export default Request;