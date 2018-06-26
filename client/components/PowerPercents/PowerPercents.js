// Power percents that reached more then 2% per 10sec(update prices time) OR get down more then 10% in 2h(default)
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';

import clearSession from "../../common/functions/clearSession";

import { fetchPowerSymbols, deletePower } from '../../actions/api';

import PowerOne from '../PowerOne/PowerOne';

import './PowerPercents.sass';

class PowerPercents extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            errors: ''
        };
    };

    componentDidMount() {
        // window.onscroll = this.setSeen;
        // const newPowers = this.props.powers.filter(item => !item.isSeen);
        // if(newPowers.length > 0) {
        //     this.props.setSeenPowers(this.props.user._id); // Set powers symbols to to seen
        // };
    };

    componentDidUpdate(prevProps) {
        if((this.props.user !== prevProps.user) && !isEmpty(this.props.user)) {
            this.setState({ loading: true });
            this.props.fetchPowerSymbols(this.props.user._id)
                .then(() => this.setState({ loading: false }))
                .catch(err => {
                    const errors = clearSession(this, err);
                    if(errors) this.setState({ errors });
                });
        };
    };

    // setSeen = (powerId, bottom) => {
    //     console.log(powerId, bottom);
    // };

    deletePower = id => {
        return this.props.deletePower(id, this.props.user._id)
            .catch(err => {
                const errors = clearSession(this, err);
                if(errors) this.setState({ errors });
            })
    };

    render() {
        return (
            <div className="PowerPercents">
                <div className="upper_bar">
                    <div className="back_to_login"
                         onClick={() => this.props.history.replace(`/user/${this.props.user._id}`)}
                    >
                        <i className="fas fa-angle-left"></i>
                    </div>
                </div>
                <h2>Power symbols:</h2>

                {this.state.errors && <div className="error">{this.state.errors}</div>}

                <div className="power_wrapper">
                    {this.props.powers.map(item =>
                        <PowerOne
                            key={item._id}
                            item={item}
                            history={this.props.history}
                        />
                    )}
                    {this.props.powers.length < 1 && <div className="empty">This stash is empty now</div>}
                </div>
            </div>
        );
    };
};

PowerPercents.propTypes = {
    powers: PropTypes.array.isRequired, // Array of power symbols
    user: PropTypes.object.isRequired, // Object with user data
    fetchPowerSymbols: PropTypes.func.isRequired, // Fetch power symbols when component just mounted and still stay without socket data
};

const mapState = state => {
    return {
        powers: state.powerPercents,
        user: state.user
    }
};

export default connect(mapState, { fetchPowerSymbols })(PowerPercents);