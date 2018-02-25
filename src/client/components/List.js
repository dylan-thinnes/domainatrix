import React from "react";
import Item from "./Item";
import { map } from "lodash";

export default class List extends React.Component {
    constructor () {
        super();
        this.names = [];
        this.items = [];
    }
    
    domainToItem (domain) {
        return (<Item name={ domain.name } dns={ domain.dns } ping={ domain.ping } http={ domain.http }></Item>);
    }

    render () {
        return (
        <div className="list">
            There is a header
            { map(this.props.domains, this.domainToItem) }
        </div>
        );
    }
}
