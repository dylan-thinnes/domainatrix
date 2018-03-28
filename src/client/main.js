import React from "react";
import ReactDom from "react-dom";
import { HashRouter, Route } from "react-router-dom";
import Media from "react-media";
import "jquery";
import "bootstrap";
import "./js/script.js";
import Layout from "./components/Layout";

var root = document.getElementById("react-app");
ReactDom.render(
    <HashRouter>
        <Route path="/" component={ Layout }/>
    </HashRouter>    
    , root);
