import React from "react";
import { Item, Header, Footer } from "./Item";
import { map } from "lodash";

export default class List extends React.Component {
    constructor () {
        super();
        this.state = {};
        this.state.page = 0;
        this.state.pageSize = 10;
    }
    setPage (newPage) { 
        var newState = this.state;
        newState.page = newPage;
        this.setState(newState);
    }
    setPageSize (newPageSize) { 
        console.log("newPageSize ", newPageSize);
        var newState = this.state;
        newState.page = Math.floor(this.state.page * this.state.pageSize / newPageSize);
        newState.pageSize = newPageSize;
        this.setState(newState);
    }

    dataToItem (data, index, arr, mode = 0) {
        if      (mode === 1) var El = Header;
        else if (mode === 2) var El = Footer;
        else                 var El = Item;
        if (mode === 2) console.log("Fotter: ", data);
        return (<El key={ Math.random().toString() } name={ data.name } dns={ data.dns } ping={ data.ping } http={ data.http } total={ data.total }></El>);
    }

    render () {
        var page = this.state.page;
        var domainsCount = this.props.domains.length;
        var domains = this.props.domains.slice(page * this.state.pageSize, page * this.state.pageSize + this.state.pageSize);
        var items = domains.map(this.dataToItem.bind(this));
        return [ <div className="list-group list-group-sm m-0">{ this.dataToItem({}, undefined, undefined, 1) }</div>
               , <div className="list domains list-group list-group-sm m-0 list-group-active">{ items }</div>
               , <Paginator pageSize={ this.state.pageSize } pageCount={ Math.floor(domainsCount / this.state.pageSize) } currPage={ page } onPageChange={ this.setPage.bind(this) } onPageSizeChange={ this.setPageSize.bind(this) }/>
               , <div className="list-group list-group-sm m-0">{ this.dataToItem({ total: domainsCount }, undefined, undefined, 2) }</div>
               ];
    }
}

class Paginator extends React.Component {
    constructor () {
        super();
        this.sectionSize = 5;
        this.state = {};
        this.state.currSection = 0;
    }

    componentWillMount () {
        console.log("component mounting...");
        window.lastSection = () => { return this.lastSection; }
        window.onLastSection = () => { return this.onLastSection; }
    }

    createPageItem (customClass, content, onClickHandler) {
        return (<button class={ "btn " + customClass } onClick={ onClickHandler }>{ content }</button>);
    }
    
    get lastSection () { return Math.floor((this.props.pageCount - 1) / this.sectionSize); }
    isLastSection (section) { return section === this.lastSection; }
    get onLastSection () { return this.isLastSection(this.state.currSection); }

    get onFirstSection () { return this.state.currSection === 0; }

    nextSection () {
        if (this.onLastSection) return;
        this.state.currSection += 1;
        this.setState(this.state);
    }

    prevSection () {
        if (this.onFirstSection) return;
        this.state.currSection -= 1;
        this.setState(this.state);
    }

    gotoSection (newSection) {
        if (newSection > this.lastSection) newSection = this.lastSection;
        if (newSection < 0) newSection = 0;
        this.state.currSection = newSection;
        this.setState(this.state);
    }

    changePageSize (newSize) {
        if (this.section) this.section = 0;
    }

    gotoPage (newPage) {
        this.props.onPageChange(newPage);
    }

    render () {
        console.log("section: ", this.state.currSection);
        var pageCount = this.props.pageCount;
        var currPage = this.props.currPage;

        var elements = [];
        for (var ii = this.state.currSection * this.sectionSize; ii < (this.state.currSection * this.sectionSize + this.sectionSize); ii++) {
            var isCurrPage = ii === currPage;
            var customClass = isCurrPage ? "btn-primary" : "btn-outline-primary";
            customClass += pageCount < ii ? " disabled" : "";
            let newPageItem = this.createPageItem( customClass
                                                 , ii
                                                 , currPage !== ii ? this.gotoPage.bind(this, ii) : undefined
                                                 );
            elements.push(newPageItem);
        }

        return (
            <div class="btn-toolbar mb-2 justify-content-center">
                <div class="btn-group mt-1">
                    { this.createPageItem( "btn-outline-dark " + (this.onFirstSection ? "disabled" : "")
                                         , "Prev " + this.sectionSize.toString()
                                         , this.prevSection.bind(this)
                                         ) }
                    { elements }
                    { this.createPageItem( "btn-outline-dark " + (this.onLastSection ? "disabled" : "")
                                         , "Next " + this.sectionSize.toString()
                                         , this.nextSection.bind(this)
                                         ) }
                </div>
                <div class="dropup pl-2 show mt-1">
                    <button class="btn btn-primary dropdown-toggle" data-toggle="dropdown">
                        { this.props.pageSize.toString() + " / page" }
                    </button>
                    <div class="dropdown-menu">
                        <button class="dropdown-item" onClick={ _ => this.props.onPageSizeChange(100) }>100</button>
                        <button class="dropdown-item" onClick={ _ => this.props.onPageSizeChange(50) }>50</button>
                        <button class="dropdown-item" onClick={ _ => this.props.onPageSizeChange(25) }>25</button>
                        <button class="dropdown-item" onClick={ _ => this.props.onPageSizeChange(10) }>10</button>
                    </div>
                </div>
            </div>
        );
    }
}
