import React from "react";
import * as Info from "./Info";

import ReactDom from "react-dom";
import { Route, Link, Switch } from "react-router-dom";
import Media from "react-media";

import List from "./List";
import Domain from "./Domain";
import Overview from "./Overview";

import initMockData from "../../../../18012901.json";
//import initMockData from "../../../../mock.json";
import { map } from "lodash";
var mockData = map(initMockData, (domain) => {
    var res = domain;
    res.name = domain.domainName;
    return res;
});
console.log("mockData", mockData);

export default class Layout extends React.Component {
    constructor () {
        super();
        this.state = {};
        this.state.domains = mockData;
        window.domains = this.state.domains;
        setTimeout(() => {
            var newState = { domains: this.state.domains.slice() };
            newState.domains[0].http = 500;
            this.setState(newState);
        }, 20000);
    }

    buildMatrix (props) {
        console.log(Math.random());
        return (
        <div id="matrix" className="col h-100 d-flex flex-column" style={{ "overflow-y": "scroll" }}>
            <List domains={ this.state.domains }></List>
        </div>
        );
    }

    buildDetails (props) {
        return (
        <div id="details" className="col h-100">
            <Switch>
                <Route path="/domain/:name" component={ Domain }/>
                <Route path="/" component={ Overview }/>
            </Switch>
        </div>
        );
    }

    render () {
        if (this.matrix === undefined) this.matrix = this.buildMatrix();
        if (this.details === undefined) this.details = this.buildDetails();
        return ([
Info.what.element,
Info.why.element,
Info.how.element,
Info.who.element,
<div className="page container-fluid d-flex flex-column">    
    <div className="row justify-content-center">
        <p class="h3 text-center w-100 pt-2"><span className="d-none d-md-inline">Welcome to the </span><b>Domainatrix</b></p>
        <button className="mx-1 btn faq btn-info" data-toggle="modal" data-target="#what">{ "What?" }</button>
        <button className="mx-1 btn faq btn-danger" data-toggle="modal" data-target="#why"> { "Why?" }</button>
        <button className="mx-1 btn faq btn-warning" data-toggle="modal" data-target="#how"> { "How?" }</button>
        <button className="mx-1 btn faq btn-success" data-toggle="modal" data-target="#who"> { "Who?" }</button>
    </div>
    <div id="main" className="mt-1 row">
        <Media query="(min-width: 992px)">
            { (screenIsLarge) => {
                return screenIsLarge ? (
                    [ this.matrix
                    , this.details ]
                ) : (
                    <Switch>
                        <Route path="/domain/:name" render={ _ => this.details }/>
                        <Route path="/" render={ _ => this.matrix }/>
                    </Switch>
                )
            } }
        </Media>
    </div>
</div>
        ]);
    }
}
