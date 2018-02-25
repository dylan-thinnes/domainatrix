import React from "react";
import ReactDom from "react-dom";
import { HashRouter, Route, Link } from "react-router-dom";
import "jquery";
import "bootstrap";
import "./js/script.js";
import List from "./components/List";
import Domain from "./components/Domain";

class App extends React.Component {
    constructor () {
        super();
        this.state = {};
        this.state.domains = [
            { name: "ed.ac.uk", ping: 12, http: 200 },
            { name: "www.ed.ac.uk", ping: 99, http: 500 },
            { name: "seine.ed.ac.uk", ping: 1, http: 300 }
        ];
        window.domains = this.state.domains;
        setTimeout(() => {
            var newState = { domains: this.state.domains.slice() };
            newState.domains[0].http = 500;
            this.setState(newState);
        }, 2000);
    }
    render () {
        console.log("rendering app.", this.state.domains);
        return (
<div className="page container-fluid">    
    <div className="row">
        <div className="col">
            <List domains={ this.state.domains }></List>
        </div>
        <div className="col">
            <Route path="/domain/:name" component={ Domain }/>
        </div>
    </div>
</div>
        );
    }
}
var root = document.getElementById("react-app");
ReactDom.render(
    <HashRouter>
        <Route path="/" component={ App }/>
    </HashRouter>    
    , root);
