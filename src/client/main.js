import React from "react";
import ReactDom from "react-dom";
import "./js/script.js";
import List from "./components/List";

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
        return <List domains={ this.state.domains }></List>
    }
}
var root = document.getElementById("react-app");
ReactDom.render(<App/>, root);
