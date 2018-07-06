export default function(e) {
    const name = e.target.getAttribute('name');
    this.setState({
        errors: {
            ...this.state.errors,
            [name]: ''
        }
    });
};