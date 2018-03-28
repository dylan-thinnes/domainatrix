import React from "react";
import { Link } from "react-router-dom";
export class DefaultItem extends React.Component {
    constructor () {
        super();
        this.linkify = true;
        this.columnType = "button";
        this.addonClass = "py-1 px-0";
    }

    link (el) { 
        var className = "item list-group-item border-0 " + this.addonClass;

        if (this.linkify === false) return <a className={ className }>{ el }</a>;
        return <Link to={ "/domain/" + this.props.name } className={ className }>
            { el }
        </Link>
    }

    column (prop, isName = false) {
        var className = this[prop].status();
        var text   = this[prop].text();
        if (isName) className += " w-100 text-left ";
        else        className += " stat text-center ";
        if (this.columnType === "input") return <input  type="text" class={ className } placeholder={ text }/>
        else                             return <button class={ className }>{ text }</button>
    }

    get http () {
        return {
            status: this.httpStatus.bind(this),
            text:   this.httpText.bind(this),
        }
    }
    get ping () {
        return {
            status: this.pingStatus.bind(this),
            text:   this.pingText.bind(this),
        }
    }
    get dns () {
        return {
            status: this.dnsStatus.bind(this),
            text:   this.dnsText.bind(this),
        }
    }
    get name () {
        return {
            status: this.nameStatus.bind(this),
            text:   this.nameText.bind(this),
        }
    }

    addonData () { return; }

    httpStatus () { return "btn btn-dark"; }
    httpText () { return this.props.http; }
    pingStatus () { return "btn btn-dark"; }
    pingText () { return this.props.ping; }
    dnsStatus  () { return "btn btn-dark"; }
    dnsText  () { return this.props.dns; }
    nameStatus () { return "btn btn-dark"; }
    nameText () { return this.props.name; }

    render () {
        return this.link(
        <div class="input-group input-group-sm flex-nowrap">
            <div class="input-group-prepend">
                { this.column("dns") }
                { this.column("ping") }
                { this.column("http") }
            </div>
            <div class="input-group-append" style={{ "flex": "1 1 auto", "width": "0" }}>
                { this.column("name", true) }
            </div>
            { this.addonData() }
        </div>
        );
    }
    // <Link to={ "/domains/" + this.props.name } className="item list-group-item list-group-item-action border-0 rounded-0">
}

export class Header extends DefaultItem {
    constructor () {
        super()
        this.linkify = false;
        this.addonClass += " pt-2 rounded-top no-outline";
    }

    httpText () { return "HTTP"; }
    pingText () { return "Ping"; }
    dnsText  () { return "DNS"; }
    nameText () { return "(subdomain here).ed.ac.uk"; }
}

export class Footer extends DefaultItem {
    constructor () {
        super()
        this.linkify = false;
        this.columnType = "input";
        this.addonClass += " pb-2 rounded-bottom no-outline";
    }

    addonData () {
        return (
        <div className="input-group-append">
            <div class="input-group-text">{ this.props.total.toString() + " results." }</div>
            <button class="btn btn-primary">Search</button>
        </div>
        )
    }

    defaultStatus () { return "form-control rounded-0 border-top-0 border-right-0 border-left-0 border-secondary"; }
    httpStatus () { return this.defaultStatus(); }
    pingStatus () { return this.defaultStatus(); }
    dnsStatus  () { return this.defaultStatus(); }
    nameStatus () { return this.defaultStatus(); }

    httpText () { return "HTTP"; }
    pingText () { return "Ping"; }
    dnsText  () { return "DNS"; }
    nameText () { return "Search by Name"; }
}

export class Item extends DefaultItem {
    constructor () {
        super()
        this.addonClass += " list-group-item-action";
    }

    httpStatus () {
        var http = this.props.http;
        if (http >= 400) return "btn btn-danger";
        else             return "btn btn-success";
    }
    pingStatus () { return "btn btn-success"; }
    dnsStatus  () { return "btn btn-danger"; }
    nameStatus () { return "btn btn-link"; }

    httpText () {
        var http = this.props.http;
        var text = http.toString();
        return text;
    }
    pingText () {
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
        return text;
    }
    dnsText () {
        return "N/A";
    }
}
