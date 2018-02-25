import React from "react";

export default class Domain extends React.Component {
    constructor () {
        super();
    }

    render () {
        window.domainThis = this;
        return (<div className="display">{ this.props.match.params.name }</div>);
    }
}
