import './Application.sass';

class Application extends React.Component {

    render() {
        return (
           <div className="Application">
               {this.props.children}
           </div>
        );
    }
}

export default Application;