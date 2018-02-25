import React from "react";
export default class Item extends React.Component {
    constructor () {
        super();
    }

    parseHttp () {
        var http = this.props.http;
        var text = " " + http.toString();
        if (http >= 400) return <span className="red">{text}</span>;
        else             return <span className="green">{text}</span>;
    }
    parsePing (ping) {
        var ping = this.props.ping;
        var suffix = "ms";
        if (ping < 1000) suffix = "µs";
        else if (ping < 10000) {
            ping = Math.floor(ping / 100) / 10;
            if (ping === parseInt(ping)) ping = ping.toString() + ".0"
        } else if (ping < 1000000) ping = Math.floor(ping / 1000);
        else {
            ping = Math.floor(ping / 1000000);
            suffix = "s";
        }
        var text = (ping.toString() + suffix).padStart(5, " ");
        return <span className="green">{ text }</span>;
    }
    parseDns (dns) {
        return <span className="green">Nope!</span>;
    }
    
    render () {
        console.log("rendering element again", this.props);
        return (
        <span className="item"><br/>{ this.parseHttp() } { this.parseDns() } { this.parsePing() } { this.props.name }</span>
        );
    }
}
