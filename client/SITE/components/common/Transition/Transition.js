const defaultTransitionDuration = 500;

export default class Transition extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: this.props.show,
            appear: false,
            enterFromStyle: this.props.enter ? this.props.enter.from : { opacity: 0 },
            enterToStyle: this.props.enter ? this.props.enter.to : { opacity: 1 },
            leaveFromStyle: this.props.leave ? this.props.leave.from : { opacity: 0 },
            leaveToStyle: this.props.leave ? this.props.leave.to : { opacity: 0 },

            currentStyle: this.props.enter ? this.props.enter.from : { opacity: 0 }
        };
    };

    componentDidMount() {
        this.addChildrenStyles('initial');
    };


    componentDidUpdate(prevProps, prevState) {
        if(this.props.show !== prevProps.show) {
            if(this.props.show) {
                this.setState({ show: true });
                setTimeout(() => this.setState({ currentStyle: this.state.enterToStyle }), 0);
            } else {
                this.setState({ currentStyle: this.state.leaveFromStyle });
                setTimeout(() => this.setState({ currentStyle: this.state.leaveToStyle }), (this.props.timeout || defaultTransitionDuration) / 2);

                setTimeout(() => {
                    this.setState({ currentStyle: this.state.enterFromStyle, show: false });
                }, this.props.timeout || defaultTransitionDuration);

            };
        };

        if(this.state.currentStyle !== prevState.currentStyle) {
            this.addChildrenStyles();
        };

    };

    addChildrenStyles = (initial, done) => {
        const children = this.mainRef.children;
        const styles = this.state.currentStyle;
        for(let i = 0; i < children.length; i++) {
            const item = children[i];
            Object.keys(styles).forEach(prop => {
                item.style[prop] =  styles[prop];
                if(initial) {
                    item.style['transition-duration'] = `${(this.props.timeout || defaultTransitionDuration) / 2}ms`;
                };
            })
        };

    };

    render() {
        const addStyles = this.props.style || {};
        return (
            <div
                ref={node => this.mainRef = node}
                style={{
                    display: !this.state.show && 'none',
                    ...addStyles
                }}
                className="Wc_Transition"
            >
                {this.props.children}
            </div>
        );
    };
};

Transition.propTypes = {
    show: PropTypes.bool.isRequired, // Sign that show hide or not element/s
    timeout: PropTypes.number, // Duration of animation (Default 500ms)
    appear: PropTypes.shape({
        from: PropTypes.object.isRequired,
        to: PropTypes.object.isRequired,
    }), // Css properties for appear/enter animation (Default it's "fade")
    leave: PropTypes.shape({
        from: PropTypes.object.isRequired,
    }), // Css properties for leave/disappear animation (Default it's "fade")
};