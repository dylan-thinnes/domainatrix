/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__script_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__script_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__script_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_html__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_html___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__index_html__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__style_css__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__style_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__style_css__);





/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var RemoteProperty = function (initJson, checker, parser, change, limit, startCallback, getRemote, initCallback) {
	this.checker = checker ? checker : ()=>{};
	this.parser = parser ? parser : function () {return arguments};
	this.change = change ? change : ()=>{};
	this.initCallback = initCallback ? initCallback : ()=>{};
	this.gettingRemote = false;
	this.value = initJson.value;
	this.state = initJson.state;
	this.lastUpdate = initJson.lastUpdate;
	this.callbacks = [];
	this.startCallback = startCallback ? startCallback : ()=>{};
	this.lastCall = 0;
	this.limit = limit ? limit : 0;
	initCallback = initCallback ? initCallback : ()=>{};
	if (getRemote === true) this.getRemote(initCallback);
	else initCallback(this.value);
}
RemoteProperty.prototype.getRemote = function (callback) {
	for (var ii = 0; ii < arguments.length; ii++) {
		if (typeof arguments[ii] === "function") this.callbacks.push(arguments[ii]);
	}
	if (this.gettingRemote === false) {
		if (this.lastCall + this.limit > Date.now()) this.runCallbacks();
		else {
			this.lastCall = Date.now();
			this.gettingRemote = true;
			this.startCallback(this.value);
			this.checker(this.setValue.bind(this));
		}
	}
}
RemoteProperty.prototype.setValue = function () {
	var newData = this.parser.apply(this, arguments);
    this.value = newData.value;
    this.state = newData.state;
    this.lastUpdate = newData.update;
	this.change(newData);
	this.runCallbacks();
}
RemoteProperty.prototype.runCallbacks = function () {
	while (this.callbacks.length > 0) {
		(this.callbacks.pop())(this.value);
	}
}

var Toggler = function (infoNode, buttonNode, showingText, hiddenText) {
	this.info = infoNode;
	this.button = buttonNode;
	if (showingText === undefined && hiddenText === undefined) this.useText = false;
	else this.useText = true;
	this.hiddenText = hiddenText ? hiddenText : this.button.innerHTML;
	this.showingText = showingText ? showingText : this.button.innerHTML;
	this.showing = this.info.classList.contains("hide");
	this.toggle();
	this.button.addEventListener("click", this.toggle.bind(this));
}
Toggler.prototype.toggle = function () {
	if (this.showing) this.hide();
	else this.show();
	this.showing = !this.showing;
}
Toggler.prototype.hide = function () {
	this.info.classList.toggle("hide");
	if (this.useText === true) this.button.innerHTML = this.hiddenText;
}
Toggler.prototype.show = function () {
	this.info.classList.toggle("hide");
	if (this.useText === true) this.button.innerHTML = this.showingText;
}
var blurb = new Toggler(document.getElementById("guide"), document.getElementById("toggleGuide"), "What is this? / More Info -", "What is this? / More Info +");
var logToggler = new Toggler(document.getElementById("log"), document.getElementById("feedback"));

var Log = function (logId) {
    this.node = document.getElementById(logId);
    this.empty = true;
}
Log.prototype.add = function (item) {
    if (this.empty === true) {
        this.empty = false;
        this.node.innerHTML = "";
    }
    var newItemNode = document.createElement("li");
    newItemNode.classList.add("item");
    newItemNode.innerHTML = Date.now().toString() + " " + item.name;
    if (item.state === 0) newItemNode.classList.add("green");
    else if (item.state === 1) newItemNode.classList.add("blue");
    else newItemNode.classList.add("red");
    this.node.insertBefore(newItemNode, this.node.firstChild);
}

var DomainListItem = function (domainJson, infoOutput) {
	this.domain = domainJson.name;
	this.infoOutput = infoOutput;
	this.initJson = domainJson;
	this.tempId = (Math.random() * Math.pow(2,32)).toString(16);
	this.dns = new RemoteProperty(domainJson.dns, this.getX.bind(this, "/v1/domains/" + this.domain + "/dns"), JSON.parse.bind(JSON), this.update.bind(this), 30*60*1000, this.setDns.bind(this, {state: -1}), false);
	this.ping = new RemoteProperty(domainJson.ping, this.getX.bind(this, "/v1/domains/" + this.domain + "/ping"), JSON.parse.bind(JSON), this.update.bind(this), 30*60*1000, this.setPing.bind(this, {state: -1}), false);
	this.http = new RemoteProperty(domainJson.http, this.getX.bind(this, "/v1/domains/" + this.domain + "/http"), JSON.parse.bind(JSON), this.update.bind(this), 30*60*1000, this.setHttp.bind(this, {state: -1}), false);
	this.children = new RemoteProperty(domainJson.children, this.getX.bind(this, "/v1/domains/" + this.domain + "/children"), JSON.parse.bind(JSON), this.update.bind(this), 30*60*1000, this.setChildren.bind(this, {state: -1}), false);
	var match = this.domain.match(/(([^\s]+)\.|)ed\.ac\.uk$/);
	this.hidden = false;
	if (match === null) {
		this.hide();
		this.show = this.hide;
	} else {
		this.subdomain = match[2] !== undefined ? match[2] : "(ed.ac.uk)";
	}
	this.updateKey = {
		"name": ()=>{},
		"dns": this.setDns.bind(this),
		"ping": this.setPing.bind(this),
		"http": this.setHttp.bind(this),
		"children": this.setChildren.bind(this),
	}
	this.focused = false;
}
DomainListItem.prototype.domString = function (styling) {
	return `<li class="item" id="` + this.tempId + `" ` + (styling === undefined ? "" : styling) + `><span style="background-color: ` + this.colorCode[this.dns.state] + `" class="domainDns">` + this.formatDns() + `</span>|<span style="background-color: ` + this.colorCode[this.ping.state] + `" class="domainPing">` + this.formatPing() + `</span>|<span style="background-color: ` + this.colorCode[this.http.state] + `" class="domainHttp">` + this.formatHttp() + `</span>|<span class="domainPrefix">` + this.subdomain + `</span></li>`;
}
DomainListItem.prototype.initializeNodes = function (root) {
	this.nodes = {};
	if (root === undefined) this.nodes.root = document.getElementById(this.tempId);
	else this.nodes.root = root;
	this.nodes.root.addEventListener("click", this.infoOutput.setFocus.bind(this.infoOutput, this.domain));
	this.nodes.dns = this.nodes.root.children[0];
	this.nodes.ping = this.nodes.root.children[1];
	this.nodes.http = this.nodes.root.children[2];
	if (this.ping.lastUpdate === 0 || this.ping.state === -1 || this.ping.state === -2) {
		this.ping.getRemote(console.log.bind(this, "ping update ran due to 0 lastUpdate"));
	}
	if (this.http.lastUpdate === 0 || this.http.state === -1 || this.http.state === -2) {
		this.http.getRemote(console.log.bind(this, "http update ran due to 0 lastUpdate"));
	}
	/*if (this.children.lastUpdate === 0 || this.children.state === -1 || this.children.state === -2) {
		this.children.getRemote(console.log.bind(this, "children update ran due to 0 lastUpdate"));
	}*/
}
DomainListItem.prototype.formatPing = function () {
    if (this.ping.state !== 0 || this.ping.value == undefined) return "-----";
    var suffix = "ms";
    var value = this.ping.value;
    if (value < 1000) suffix = "&#956;s";
    else if (value < 10000) {
        value = Math.floor(value / 100) / 10;
        if (value === parseInt(value)) value = value.toString() + ".0"
    } else if (value < 1000000) value = Math.floor(value / 1000);
    else {
        value = Math.floor(value / 1000000);
        suffix = "s";
    }
    var result = value.toString() + suffix;
    return result.padStart(5, " ");
}
DomainListItem.prototype.formatHttp = function () {
    if (this.http.state !== 0 || this.http.value == undefined) return "----";
    return " " + this.http.value.toString();
}
DomainListItem.prototype.formatDns = function () {
    if (this.dns.state !== 0 || this.dns.value == undefined) return "-----";
    var result = "";
    result += this.dns.value["A"]     == undefined ? " " : "4";
    result += this.dns.value["AAAA"]  == undefined ? " " : "6";
    result += this.dns.value["CNAME"] == undefined ? " " : "C";
    result += this.dns.value["MX"]    == undefined ? " " : "M";
    result += this.dns.value["TXT"]   == undefined ? " " : "T";
    return result;
}
DomainListItem.prototype.formatDate = function (timestamp) {
	if (timestamp === 0) return "Still Checking";
	var date = new Date(timestamp);
	return (date.getUTCFullYear()-2000).toString().padStart(2, "0") + "/" + date.getUTCMonth().toString().padStart(2, "0") + "/" + date.getUTCDate().toString().padStart(2, "0") + " " + date.getUTCHours().toString().padStart(2, "0") + ":" + date.getUTCMinutes().toString().padStart(2, "0");
}
DomainListItem.prototype.getX = function (endpoint, callback) { 
	var req = new XMLHttpRequest();
	req.open("PUT", endpoint);
	req.onreadystatechange = (function (callback) {
		if (this.readyState === 4) {
			callback(req.response);
		}
	}).bind(req, callback);
	req.send();
}
DomainListItem.prototype.update = function (newJson) {
	for (var index in newJson) {
		if (newJson[index] !== this[index]) {
			this.updateKey[index](newJson[index]);
		}
	}
}
DomainListItem.prototype.colorCode = {
	"-1": "#CDDC39",
	"0": "#4CAF50",
	"1": "#FF5722",
}
DomainListItem.prototype.setDns = function (newDns) {
	if (newDns !== undefined) {
		this.dns.value = newDns.value !== undefined ? newDns.value : this.dns.value;
		this.dns.state = newDns.state !== undefined ? newDns.state : this.dns.state;
		this.dns.lastUpdate = newDns.lastUpdate !== undefined ? newDns.lastUpdate : this.dns.lastUpdate;
	}
	this.nodes.dns.style.backgroundColor = this.colorCode[this.dns.state];
    this.nodes.dns.innerHTML = this.formatDns();
	//this.nodes.dnsLastCheck.innerHTML = "DNS Last Checked: " + this.formatDate(this.dns.lastUpdate);
	if (this.focused === true) this.infoOutput.setDns(this.dns.state, this.formatDate(this.dns.lastUpdate));
}
DomainListItem.prototype.setChildren = function (newChildren) {
    if (newChildren !== undefined) {
		this.children.value = newChildren.value !== undefined ? newChildren.value : this.children.value;
		this.children.state = newChildren.state !== undefined ? newChildren.state : this.children.state;
		this.children.lastUpdate = newChildren.lastUpdate !== undefined ? newChildren.lastUpdate : this.children.lastUpdate;
    }
}
DomainListItem.prototype.setPing = function (newPing) {
	if (newPing !== undefined) {
		this.ping.value = newPing.value !== undefined ? newPing.value : this.ping.value;
		this.ping.state = newPing.state !== undefined ? newPing.state : this.ping.state;
		this.ping.lastUpdate = newPing.lastUpdate !== undefined ? newPing.lastUpdate : this.ping.lastUpdate;
	}
	this.nodes.ping.style.backgroundColor = this.colorCode[this.ping.state];
    this.nodes.ping.innerHTML = this.formatPing();
	//this.nodes.pingLastCheck.innerHTML = "Ping Last Checked: " + this.formatDate(this.ping.lastUpdate);
	if (this.focused === true) this.infoOutput.setPing(this.ping.state, this.formatDate(this.ping.lastUpdate));
}
DomainListItem.prototype.setHttp = function (newHttp) {
	if (newHttp !== undefined) {
		this.http.value = newHttp.value !== undefined ? newHttp.value : this.http.value;
		this.http.state = newHttp.state !== undefined ? newHttp.state : this.http.state;
		this.http.lastUpdate = newHttp.lastUpdate !== undefined ? newHttp.lastUpdate : this.http.lastUpdate;
	}
	this.nodes.http.style.backgroundColor = this.colorCode[this.http.state];
    this.nodes.http.innerHTML = this.formatHttp();
	//this.nodes.httpLastCheck.innerHTML = "HTTP Last Checked: " + this.formatDate(this.http.lastUpdate);
	if (this.focused === true) this.infoOutput.setHttp(this.http.state, this.formatDate(this.http.lastUpdate));
}
DomainListItem.prototype.hide = function () {
	this.nodes.root.style.display = "none";
	this.hidden = true;
}
DomainListItem.prototype.show = function () {
	this.nodes.root.style.display = "";
	this.hidden = false;
}
DomainListItem.prototype.toggle = function () {
	if (this.hidden) this.show();
	else this.hide();
}
var DomainList = function (id, searchId, submitId, feedbackId, updateId, domainCountId, infoId, logId, callback) {
	/*
	state -2: Getting server domain list.
	state -1: Querying about one domain.
	state 0: The domain is legitimate.
	state 1: The domain is already in the remote list.
	state 2: The domain has no dns lookup.
	state 3: The domain does not meet the regular expression standard.
	state 4: The server returned its domain list.
	state 5: The server did not return a domain list.
	*/
	this.node = document.getElementById(id);
	this.searchNode = document.getElementById(searchId); 
	this.searchNode.addEventListener("keypress", this.searchDomainItems.bind(this));
	this.entries = {};
	this.orderedDomains = [];
	this.inputNode = document.getElementById(submitId);
	this.inputNode.addEventListener("keydown", this.handleInputKeys.bind(this));
	this.domainCount = document.getElementById(domainCountId);
	this.info = new DomainInfo(document.getElementById(infoId), this);
	this.state = 0;
	this.stagingArea = document.getElementById("stagingArea");
	this.feedback = {
		node: document.getElementById(feedbackId),
		stateTexts: {
			"-3": "Rendering new list of domains...",
			"-2": "Querying server for list of domains...",
			"-1": "Querying server about submitted domain...",
			"0":  "Domain(s) found and added.",
			"1":  "Domain is already in the list.",
			"2":  "Domain has no DNS entry.",
			"3":  "Domain is not a subdomain of ed.ac.uk.",
			"4":  "List of domains found and rendered.",
			"5":  "Could not get the domain list from server."
		},
		stateClasses: {
			"-3": "yellow",
			"-2": "yellow",
			"-1": "yellow",
			"0":  "green",
			"1":  "blue",
			"2":  "red",
			"3":  "red",
			"4":  "green",
			"5":  "yellow"
		},
		setState: function (state) {
            if (state === "0" || state === 0) this.countSoFar += 1;

			this.node.innerHTML = (state === "0" || state === 0 ? this.countSoFar.toString() + " " : "") + this.stateTexts[state];
            this.node.classList.remove(this.stateClasses[this.state]);
            
            this.state = state;
            this.node.classList.add(this.stateClasses[this.state]);
		},
        state: -3,
        countSoFar: 0
	}
    this.log = new Log(logId);
	this.updateNode = document.getElementById(updateId);
	this.updateNode.addEventListener("click", this.getRemoteDomains.bind(this));
	this.initDone = false;
	this.initCallback = callback;
	this.allShown = true;
	this.getRemoteDomains();
}
Object.defineProperty(DomainList.prototype, "search", {
	"get": function () {
		return this.searchNode.value;
	},
	"set": function (newSearch) {
		this.searchNode.value = newSearch;
	}
});
DomainList.prototype.setState = function (state) {
	this.state = state;
	this.feedback.setState(state);
}
DomainList.prototype.handleInputKeys = function (e) {
	if (e.keyCode === 13) {
		e.preventDefault();
		this.submitDomains(this.inputNode.value);
	}
}
DomainList.prototype.findOrderedIndex = function (domain, subsetLeft, subsetRight) {
	subsetLeft = subsetLeft !== undefined ? subsetLeft : 0;
	subsetRight = subsetRight !== undefined ? subsetRight : this.orderedDomains.length;
	while (subsetLeft !== subsetRight) {
		var checkDomain = this.orderedDomains[subsetLeft + Math.floor((subsetRight - subsetLeft) / 2)];
		if (checkDomain > domain) subsetRight = subsetLeft + Math.floor((subsetRight - subsetLeft) / 2);
		else subsetLeft = subsetRight - Math.floor((subsetRight - subsetLeft) / 2);
	}
	return subsetLeft;
}
DomainList.prototype.addDomainItem = function (resJson) {
	if (this.entries[resJson.name] === undefined) {
		var orderedIndex = this.findOrderedIndex(resJson.name);
		this.orderedDomains.splice(orderedIndex, 0, resJson.name);
		this.entries[resJson.name] = new DomainListItem(resJson, this.info);
		this.stagingArea.innerHTML = this.entries[resJson.name].domString();
		this.entries[resJson.name].initializeNodes(this.stagingArea.children[0]);
		if (this.node.children.length === 0) {
			this.node.appendChild(this.entries[resJson.name].nodes.root);
		} else if (orderedIndex === this.node.children.length) {
			this.node.appendChild(this.entries[resJson.name].nodes.root);
		} else {
			this.node.insertBefore(this.entries[resJson.name].nodes.root, this.node.children[orderedIndex]);
		}
		this.stagingArea.innerHTML = "";
		this.searchDomainItems();
	} else {
		this.entries[resJson.name].update(resJson);
	}
}
DomainList.prototype.submitDomains = function (names, callback) {
	if (this.state >= 0) {
		this.feedback.setState(-1);
		var req = new XMLHttpRequest();
		req.open("POST", "/v1/domains");
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		req.onreadystatechange = (function (req) {
			if (req.readyState === 4) {
				this.serverResponseControl(req.response);
			}
		}).bind(this, req);
		req.send("names=" + names);
	} else {
		console.log("State already running, wait until later.");
	}
}
DomainList.prototype.getRemoteDomains = function () {
	if (this.state >= 0) {
		this.setState(-2);
		this.info.resetFocus();
		var req = new XMLHttpRequest();
		req.open("GET", "/v1/domains?t=" + Date.now().toString(36));
		req.onreadystatechange = (function (req) {
			if (req.readyState === 4) {
				this.setRemoteDomains(req.response);
			}
		}).bind(this, req);
		req.send();
	} else console.log("State already running, wait until later.");
}
DomainList.prototype.setRemoteDomains = function (res) {
	try {
		var resJson = JSON.parse(res);
		this.orderedDomains = [];
		this.entries = {};
		for (var ii = 0; ii < resJson.length; ii++) {
			this.orderedDomains.push(resJson[ii].name);
			this.entries[resJson[ii].name] = new DomainListItem(resJson[ii], this.info);
		}
		this.allShown = false;
		this.searchDomainItems();
		if (this.initDone === false) {
			this.initDone = true;
			this.initCallback();
		}	
	} catch (e) {
		this.setState(5);
		console.log(e, "Illegitimate output from server on /domains endpoint.");
	}
}
DomainList.prototype.setMarkup = function (domains) {
	this.setState(-3);
	var markup = [];
	for (var ii = 0; ii < domains.length; ii++) markup.push(this.entries[domains[ii]].domString());
	this.node.innerHTML = markup.join("");
	for (var ii = 0; ii < domains.length; ii++) this.entries[domains[ii]].initializeNodes(this.node.children[ii]);
	this.setState(4);
}
DomainList.prototype.serverResponseControl = function (res) {
	try {
        var res = JSON.parse(res);
        var singleRes;
        var resLength = res.length;
        for (var ii = 0; ii < resLength; ii++) {
            singleRes = res[ii];
            this.setState(singleRes.state);
            this.log.add(singleRes);
            if (singleRes.state === 0) {
                this.addDomainItem(singleRes.data);
                if (singleRes.data.children.state === 0) {
                    for (var ii in this.children.value) {
                        var newName = this.children.value[ii];
                        this.submitDomains(newName);
                    }
                }
            }
        }
	} catch (e) {
		console.log(e, "Illegitimate output from server on /add endpoint.");
	}
}
DomainList.prototype.searchDomainItems = function (e) {
	if (e !== undefined && e.keyCode !== 13) return;
	if (this.search === "") {
		if (this.allShown !== true) {
			this.allShown = true;
			this.setMarkup(this.orderedDomains);
		}
		this.domainCount.innerHTML = this.orderedDomains.length + "/" + this.orderedDomains.length;
	} else {
		try {
			var regex = new RegExp(this.search);
		} catch (e) {
			console.log(e);
			return;
		}
		var entriesExist = 0;
		var entriesShown = 0;
		var showingDomains = [];
		for (var ii = 0; ii < this.orderedDomains.length; ii++) {
			var domain = this.orderedDomains[ii];
			var subdomain = this.entries[domain].domain === "ed.ac.uk" ? "ed.ac.uk" : this.entries[domain].subdomain;
			if (subdomain === undefined) continue;
			if (regex.test(subdomain)) {
				entriesShown++;
				showingDomains.push(domain);
			}
			entriesExist++;
		}
		this.setMarkup(showingDomains);
		this.domainCount.innerHTML = entriesShown.toString() + "/" + entriesExist.toString();
		if (entriesExist !== entriesShown) this.allShown = false;
		else this.allShown = true;
	}
}

var DomainInfo = function (node, list) {
	this.stateList = {
		"-1": ["Processing...", "#CDDC39"],
		"0": ["Success.", "#4CAF50"],
		"1": ["Failed.", "#FF5722"]
	}
	this.focus = undefined;
	this.node = node;
	this.list = list;
	this.name = this.node.children[0];
	this.dnsState = this.node.children[2].children[1].children[0];
	this.pingState = this.node.children[3].children[1].children[0];
	this.httpState = this.node.children[4].children[1].children[0];
	this.dnsLastCheck = this.node.children[2].children[1].children[2];
	this.pingLastCheck = this.node.children[3].children[1].children[2];
	this.httpLastCheck = this.node.children[4].children[1].children[2];
	this.goToDomain = this.node.children[5].children[0];
	this.resetFocus = function () {
		if (this.focus === undefined) return;
		this.focus.focused = false;
		this.focus = undefined;
		this.node.classList.add("hide");
	}
	this.setFocus = function (newFocus) {
		console.log("new focus...", newFocus);
		if (this.focus !== undefined && newFocus === this.focus.domain) {
			this.focus.focused = false;
			this.focus = undefined;
			this.node.classList.add("hide");
		} else if (this.list.entries[newFocus] !== undefined) {
			if (this.focus !== undefined) this.focus.focused = false;
			this.focus = this.list.entries[newFocus];
			this.focus.focused = true;
			this.name.innerHTML = this.focus.domain;
			this.goToDomain.href = "http://" + this.focus.domain;
			this.focus.setDns();
			this.focus.setPing();
			this.focus.setHttp();
			this.node.classList.remove("hide");
		}
	}
	this.setDns = function (newState, newDate) {
		this.dnsLastCheck.innerHTML = "DNS Last Checked: " + newDate;
		this.dnsState.innerHTML = "State: " + "<span style=\"display: inline-block; width: 13ch; background-color: " + this.stateList[newState][1] + ";\">" + this.stateList[newState][0] + "</span>";
	}
	this.setPing = function (newState, newDate) {
		this.pingLastCheck.innerHTML = "Ping Last Checked: " + newDate;
		this.pingState.innerHTML = "State: " + "<span style=\"display: inline-block; width: 13ch; background-color: " + this.stateList[newState][1] + ";\">" + this.stateList[newState][0] + "</span>";
	}
	this.setHttp = function (newState, newDate) {
		this.httpLastCheck.innerHTML = "HTTP Last Checked: " + newDate;
		this.httpState.innerHTML = "State: " + "<span style=\"display: inline-block; width: 13ch; background-color: " + this.stateList[newState][1] + ";\">" + this.stateList[newState][0] + "</span>";
	}
	this.updateX = function (x) {
		this.focus[x].getRemote();
	}
	this.node.children[2].children[0].addEventListener("click", this.updateX.bind(this, "dns"));
	this.node.children[3].children[0].addEventListener("click", this.updateX.bind(this, "ping"));
	this.node.children[4].children[0].addEventListener("click", this.updateX.bind(this, "http"));
}
console.log("Script loaded.");
var list = new DomainList("domainList", "searchDomainInput", "addDomainInput", "feedback", "updateDomainList", "domainCount", "domainInfo", "log", function () {console.log("Init of DomainList complete.")});
/*var req = new XMLHttpRequest();
req.open("GET", "/domains.txt");
req.onreadystatechange = function () {
	if (req.status === 200 && req.readyState === 4) {
		console.log(start = Date.now());
		document.getElementById("domainList").innerHTML = req.response;
		console.log(Date.now(), Date.now() - start);
	}
}
req.send();
*/


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "index.html";

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "style.css";

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYTcxMWJjZTFmNGMzMDBhZjQxOTYiLCJ3ZWJwYWNrOi8vLy4vcGFjay5qcyIsIndlYnBhY2s6Ly8vLi9zY3JpcHQuanMiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguaHRtbCIsIndlYnBhY2s6Ly8vLi9zdHlsZS5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUM3REE7QUFDQTtBQUNBOzs7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4QztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsdUJBQXVCO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0xBQStMLFVBQVU7QUFDek0sbU1BQW1NLFVBQVU7QUFDN00sbU1BQW1NLFVBQVU7QUFDN00sbU5BQW1OLFVBQVU7QUFDN047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IscUJBQXFCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLHFCQUFxQjtBQUN0QztBQUNBLGlCQUFpQixxQkFBcUI7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0JBQWdCO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsaUNBQWlDO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkVBQTZFLGFBQWEsdURBQXVEO0FBQ2pKO0FBQ0E7QUFDQTtBQUNBLDhFQUE4RSxhQUFhLHVEQUF1RDtBQUNsSjtBQUNBO0FBQ0E7QUFDQSw4RUFBOEUsYUFBYSx1REFBdUQ7QUFDbEo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0tBQWdLLDRDQUE0QztBQUM1TTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDcmlCQSxzRDs7Ozs7O0FDQUEscUQiLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYTcxMWJjZTFmNGMzMDBhZjQxOTYiLCJpbXBvcnQgXCIuL3NjcmlwdC5qc1wiO1xuaW1wb3J0IFwiLi9pbmRleC5odG1sXCI7XG5pbXBvcnQgXCIuL3N0eWxlLmNzc1wiO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9wYWNrLmpzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcbnZhciBSZW1vdGVQcm9wZXJ0eSA9IGZ1bmN0aW9uIChpbml0SnNvbiwgY2hlY2tlciwgcGFyc2VyLCBjaGFuZ2UsIGxpbWl0LCBzdGFydENhbGxiYWNrLCBnZXRSZW1vdGUsIGluaXRDYWxsYmFjaykge1xuXHR0aGlzLmNoZWNrZXIgPSBjaGVja2VyID8gY2hlY2tlciA6ICgpPT57fTtcblx0dGhpcy5wYXJzZXIgPSBwYXJzZXIgPyBwYXJzZXIgOiBmdW5jdGlvbiAoKSB7cmV0dXJuIGFyZ3VtZW50c307XG5cdHRoaXMuY2hhbmdlID0gY2hhbmdlID8gY2hhbmdlIDogKCk9Pnt9O1xuXHR0aGlzLmluaXRDYWxsYmFjayA9IGluaXRDYWxsYmFjayA/IGluaXRDYWxsYmFjayA6ICgpPT57fTtcblx0dGhpcy5nZXR0aW5nUmVtb3RlID0gZmFsc2U7XG5cdHRoaXMudmFsdWUgPSBpbml0SnNvbi52YWx1ZTtcblx0dGhpcy5zdGF0ZSA9IGluaXRKc29uLnN0YXRlO1xuXHR0aGlzLmxhc3RVcGRhdGUgPSBpbml0SnNvbi5sYXN0VXBkYXRlO1xuXHR0aGlzLmNhbGxiYWNrcyA9IFtdO1xuXHR0aGlzLnN0YXJ0Q2FsbGJhY2sgPSBzdGFydENhbGxiYWNrID8gc3RhcnRDYWxsYmFjayA6ICgpPT57fTtcblx0dGhpcy5sYXN0Q2FsbCA9IDA7XG5cdHRoaXMubGltaXQgPSBsaW1pdCA/IGxpbWl0IDogMDtcblx0aW5pdENhbGxiYWNrID0gaW5pdENhbGxiYWNrID8gaW5pdENhbGxiYWNrIDogKCk9Pnt9O1xuXHRpZiAoZ2V0UmVtb3RlID09PSB0cnVlKSB0aGlzLmdldFJlbW90ZShpbml0Q2FsbGJhY2spO1xuXHRlbHNlIGluaXRDYWxsYmFjayh0aGlzLnZhbHVlKTtcbn1cblJlbW90ZVByb3BlcnR5LnByb3RvdHlwZS5nZXRSZW1vdGUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcblx0Zm9yICh2YXIgaWkgPSAwOyBpaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGlpKyspIHtcblx0XHRpZiAodHlwZW9mIGFyZ3VtZW50c1tpaV0gPT09IFwiZnVuY3Rpb25cIikgdGhpcy5jYWxsYmFja3MucHVzaChhcmd1bWVudHNbaWldKTtcblx0fVxuXHRpZiAodGhpcy5nZXR0aW5nUmVtb3RlID09PSBmYWxzZSkge1xuXHRcdGlmICh0aGlzLmxhc3RDYWxsICsgdGhpcy5saW1pdCA+IERhdGUubm93KCkpIHRoaXMucnVuQ2FsbGJhY2tzKCk7XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLmxhc3RDYWxsID0gRGF0ZS5ub3coKTtcblx0XHRcdHRoaXMuZ2V0dGluZ1JlbW90ZSA9IHRydWU7XG5cdFx0XHR0aGlzLnN0YXJ0Q2FsbGJhY2sodGhpcy52YWx1ZSk7XG5cdFx0XHR0aGlzLmNoZWNrZXIodGhpcy5zZXRWYWx1ZS5iaW5kKHRoaXMpKTtcblx0XHR9XG5cdH1cbn1cblJlbW90ZVByb3BlcnR5LnByb3RvdHlwZS5zZXRWYWx1ZSA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIG5ld0RhdGEgPSB0aGlzLnBhcnNlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMudmFsdWUgPSBuZXdEYXRhLnZhbHVlO1xuICAgIHRoaXMuc3RhdGUgPSBuZXdEYXRhLnN0YXRlO1xuICAgIHRoaXMubGFzdFVwZGF0ZSA9IG5ld0RhdGEudXBkYXRlO1xuXHR0aGlzLmNoYW5nZShuZXdEYXRhKTtcblx0dGhpcy5ydW5DYWxsYmFja3MoKTtcbn1cblJlbW90ZVByb3BlcnR5LnByb3RvdHlwZS5ydW5DYWxsYmFja3MgPSBmdW5jdGlvbiAoKSB7XG5cdHdoaWxlICh0aGlzLmNhbGxiYWNrcy5sZW5ndGggPiAwKSB7XG5cdFx0KHRoaXMuY2FsbGJhY2tzLnBvcCgpKSh0aGlzLnZhbHVlKTtcblx0fVxufVxuXG52YXIgVG9nZ2xlciA9IGZ1bmN0aW9uIChpbmZvTm9kZSwgYnV0dG9uTm9kZSwgc2hvd2luZ1RleHQsIGhpZGRlblRleHQpIHtcblx0dGhpcy5pbmZvID0gaW5mb05vZGU7XG5cdHRoaXMuYnV0dG9uID0gYnV0dG9uTm9kZTtcblx0aWYgKHNob3dpbmdUZXh0ID09PSB1bmRlZmluZWQgJiYgaGlkZGVuVGV4dCA9PT0gdW5kZWZpbmVkKSB0aGlzLnVzZVRleHQgPSBmYWxzZTtcblx0ZWxzZSB0aGlzLnVzZVRleHQgPSB0cnVlO1xuXHR0aGlzLmhpZGRlblRleHQgPSBoaWRkZW5UZXh0ID8gaGlkZGVuVGV4dCA6IHRoaXMuYnV0dG9uLmlubmVySFRNTDtcblx0dGhpcy5zaG93aW5nVGV4dCA9IHNob3dpbmdUZXh0ID8gc2hvd2luZ1RleHQgOiB0aGlzLmJ1dHRvbi5pbm5lckhUTUw7XG5cdHRoaXMuc2hvd2luZyA9IHRoaXMuaW5mby5jbGFzc0xpc3QuY29udGFpbnMoXCJoaWRlXCIpO1xuXHR0aGlzLnRvZ2dsZSgpO1xuXHR0aGlzLmJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy50b2dnbGUuYmluZCh0aGlzKSk7XG59XG5Ub2dnbGVyLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG5cdGlmICh0aGlzLnNob3dpbmcpIHRoaXMuaGlkZSgpO1xuXHRlbHNlIHRoaXMuc2hvdygpO1xuXHR0aGlzLnNob3dpbmcgPSAhdGhpcy5zaG93aW5nO1xufVxuVG9nZ2xlci5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5pbmZvLmNsYXNzTGlzdC50b2dnbGUoXCJoaWRlXCIpO1xuXHRpZiAodGhpcy51c2VUZXh0ID09PSB0cnVlKSB0aGlzLmJ1dHRvbi5pbm5lckhUTUwgPSB0aGlzLmhpZGRlblRleHQ7XG59XG5Ub2dnbGVyLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLmluZm8uY2xhc3NMaXN0LnRvZ2dsZShcImhpZGVcIik7XG5cdGlmICh0aGlzLnVzZVRleHQgPT09IHRydWUpIHRoaXMuYnV0dG9uLmlubmVySFRNTCA9IHRoaXMuc2hvd2luZ1RleHQ7XG59XG52YXIgYmx1cmIgPSBuZXcgVG9nZ2xlcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImd1aWRlXCIpLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvZ2dsZUd1aWRlXCIpLCBcIldoYXQgaXMgdGhpcz8gLyBNb3JlIEluZm8gLVwiLCBcIldoYXQgaXMgdGhpcz8gLyBNb3JlIEluZm8gK1wiKTtcbnZhciBsb2dUb2dnbGVyID0gbmV3IFRvZ2dsZXIoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2dcIiksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmVlZGJhY2tcIikpO1xuXG52YXIgTG9nID0gZnVuY3Rpb24gKGxvZ0lkKSB7XG4gICAgdGhpcy5ub2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobG9nSWQpO1xuICAgIHRoaXMuZW1wdHkgPSB0cnVlO1xufVxuTG9nLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgIGlmICh0aGlzLmVtcHR5ID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuZW1wdHkgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ub2RlLmlubmVySFRNTCA9IFwiXCI7XG4gICAgfVxuICAgIHZhciBuZXdJdGVtTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICBuZXdJdGVtTm9kZS5jbGFzc0xpc3QuYWRkKFwiaXRlbVwiKTtcbiAgICBuZXdJdGVtTm9kZS5pbm5lckhUTUwgPSBEYXRlLm5vdygpLnRvU3RyaW5nKCkgKyBcIiBcIiArIGl0ZW0ubmFtZTtcbiAgICBpZiAoaXRlbS5zdGF0ZSA9PT0gMCkgbmV3SXRlbU5vZGUuY2xhc3NMaXN0LmFkZChcImdyZWVuXCIpO1xuICAgIGVsc2UgaWYgKGl0ZW0uc3RhdGUgPT09IDEpIG5ld0l0ZW1Ob2RlLmNsYXNzTGlzdC5hZGQoXCJibHVlXCIpO1xuICAgIGVsc2UgbmV3SXRlbU5vZGUuY2xhc3NMaXN0LmFkZChcInJlZFwiKTtcbiAgICB0aGlzLm5vZGUuaW5zZXJ0QmVmb3JlKG5ld0l0ZW1Ob2RlLCB0aGlzLm5vZGUuZmlyc3RDaGlsZCk7XG59XG5cbnZhciBEb21haW5MaXN0SXRlbSA9IGZ1bmN0aW9uIChkb21haW5Kc29uLCBpbmZvT3V0cHV0KSB7XG5cdHRoaXMuZG9tYWluID0gZG9tYWluSnNvbi5uYW1lO1xuXHR0aGlzLmluZm9PdXRwdXQgPSBpbmZvT3V0cHV0O1xuXHR0aGlzLmluaXRKc29uID0gZG9tYWluSnNvbjtcblx0dGhpcy50ZW1wSWQgPSAoTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDIsMzIpKS50b1N0cmluZygxNik7XG5cdHRoaXMuZG5zID0gbmV3IFJlbW90ZVByb3BlcnR5KGRvbWFpbkpzb24uZG5zLCB0aGlzLmdldFguYmluZCh0aGlzLCBcIi92MS9kb21haW5zL1wiICsgdGhpcy5kb21haW4gKyBcIi9kbnNcIiksIEpTT04ucGFyc2UuYmluZChKU09OKSwgdGhpcy51cGRhdGUuYmluZCh0aGlzKSwgMzAqNjAqMTAwMCwgdGhpcy5zZXREbnMuYmluZCh0aGlzLCB7c3RhdGU6IC0xfSksIGZhbHNlKTtcblx0dGhpcy5waW5nID0gbmV3IFJlbW90ZVByb3BlcnR5KGRvbWFpbkpzb24ucGluZywgdGhpcy5nZXRYLmJpbmQodGhpcywgXCIvdjEvZG9tYWlucy9cIiArIHRoaXMuZG9tYWluICsgXCIvcGluZ1wiKSwgSlNPTi5wYXJzZS5iaW5kKEpTT04pLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpLCAzMCo2MCoxMDAwLCB0aGlzLnNldFBpbmcuYmluZCh0aGlzLCB7c3RhdGU6IC0xfSksIGZhbHNlKTtcblx0dGhpcy5odHRwID0gbmV3IFJlbW90ZVByb3BlcnR5KGRvbWFpbkpzb24uaHR0cCwgdGhpcy5nZXRYLmJpbmQodGhpcywgXCIvdjEvZG9tYWlucy9cIiArIHRoaXMuZG9tYWluICsgXCIvaHR0cFwiKSwgSlNPTi5wYXJzZS5iaW5kKEpTT04pLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpLCAzMCo2MCoxMDAwLCB0aGlzLnNldEh0dHAuYmluZCh0aGlzLCB7c3RhdGU6IC0xfSksIGZhbHNlKTtcblx0dGhpcy5jaGlsZHJlbiA9IG5ldyBSZW1vdGVQcm9wZXJ0eShkb21haW5Kc29uLmNoaWxkcmVuLCB0aGlzLmdldFguYmluZCh0aGlzLCBcIi92MS9kb21haW5zL1wiICsgdGhpcy5kb21haW4gKyBcIi9jaGlsZHJlblwiKSwgSlNPTi5wYXJzZS5iaW5kKEpTT04pLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpLCAzMCo2MCoxMDAwLCB0aGlzLnNldENoaWxkcmVuLmJpbmQodGhpcywge3N0YXRlOiAtMX0pLCBmYWxzZSk7XG5cdHZhciBtYXRjaCA9IHRoaXMuZG9tYWluLm1hdGNoKC8oKFteXFxzXSspXFwufCllZFxcLmFjXFwudWskLyk7XG5cdHRoaXMuaGlkZGVuID0gZmFsc2U7XG5cdGlmIChtYXRjaCA9PT0gbnVsbCkge1xuXHRcdHRoaXMuaGlkZSgpO1xuXHRcdHRoaXMuc2hvdyA9IHRoaXMuaGlkZTtcblx0fSBlbHNlIHtcblx0XHR0aGlzLnN1YmRvbWFpbiA9IG1hdGNoWzJdICE9PSB1bmRlZmluZWQgPyBtYXRjaFsyXSA6IFwiKGVkLmFjLnVrKVwiO1xuXHR9XG5cdHRoaXMudXBkYXRlS2V5ID0ge1xuXHRcdFwibmFtZVwiOiAoKT0+e30sXG5cdFx0XCJkbnNcIjogdGhpcy5zZXREbnMuYmluZCh0aGlzKSxcblx0XHRcInBpbmdcIjogdGhpcy5zZXRQaW5nLmJpbmQodGhpcyksXG5cdFx0XCJodHRwXCI6IHRoaXMuc2V0SHR0cC5iaW5kKHRoaXMpLFxuXHRcdFwiY2hpbGRyZW5cIjogdGhpcy5zZXRDaGlsZHJlbi5iaW5kKHRoaXMpLFxuXHR9XG5cdHRoaXMuZm9jdXNlZCA9IGZhbHNlO1xufVxuRG9tYWluTGlzdEl0ZW0ucHJvdG90eXBlLmRvbVN0cmluZyA9IGZ1bmN0aW9uIChzdHlsaW5nKSB7XG5cdHJldHVybiBgPGxpIGNsYXNzPVwiaXRlbVwiIGlkPVwiYCArIHRoaXMudGVtcElkICsgYFwiIGAgKyAoc3R5bGluZyA9PT0gdW5kZWZpbmVkID8gXCJcIiA6IHN0eWxpbmcpICsgYD48c3BhbiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6IGAgKyB0aGlzLmNvbG9yQ29kZVt0aGlzLmRucy5zdGF0ZV0gKyBgXCIgY2xhc3M9XCJkb21haW5EbnNcIj5gICsgdGhpcy5mb3JtYXREbnMoKSArIGA8L3NwYW4+fDxzcGFuIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogYCArIHRoaXMuY29sb3JDb2RlW3RoaXMucGluZy5zdGF0ZV0gKyBgXCIgY2xhc3M9XCJkb21haW5QaW5nXCI+YCArIHRoaXMuZm9ybWF0UGluZygpICsgYDwvc3Bhbj58PHNwYW4gc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiBgICsgdGhpcy5jb2xvckNvZGVbdGhpcy5odHRwLnN0YXRlXSArIGBcIiBjbGFzcz1cImRvbWFpbkh0dHBcIj5gICsgdGhpcy5mb3JtYXRIdHRwKCkgKyBgPC9zcGFuPnw8c3BhbiBjbGFzcz1cImRvbWFpblByZWZpeFwiPmAgKyB0aGlzLnN1YmRvbWFpbiArIGA8L3NwYW4+PC9saT5gO1xufVxuRG9tYWluTGlzdEl0ZW0ucHJvdG90eXBlLmluaXRpYWxpemVOb2RlcyA9IGZ1bmN0aW9uIChyb290KSB7XG5cdHRoaXMubm9kZXMgPSB7fTtcblx0aWYgKHJvb3QgPT09IHVuZGVmaW5lZCkgdGhpcy5ub2Rlcy5yb290ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy50ZW1wSWQpO1xuXHRlbHNlIHRoaXMubm9kZXMucm9vdCA9IHJvb3Q7XG5cdHRoaXMubm9kZXMucm9vdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5pbmZvT3V0cHV0LnNldEZvY3VzLmJpbmQodGhpcy5pbmZvT3V0cHV0LCB0aGlzLmRvbWFpbikpO1xuXHR0aGlzLm5vZGVzLmRucyA9IHRoaXMubm9kZXMucm9vdC5jaGlsZHJlblswXTtcblx0dGhpcy5ub2Rlcy5waW5nID0gdGhpcy5ub2Rlcy5yb290LmNoaWxkcmVuWzFdO1xuXHR0aGlzLm5vZGVzLmh0dHAgPSB0aGlzLm5vZGVzLnJvb3QuY2hpbGRyZW5bMl07XG5cdGlmICh0aGlzLnBpbmcubGFzdFVwZGF0ZSA9PT0gMCB8fCB0aGlzLnBpbmcuc3RhdGUgPT09IC0xIHx8IHRoaXMucGluZy5zdGF0ZSA9PT0gLTIpIHtcblx0XHR0aGlzLnBpbmcuZ2V0UmVtb3RlKGNvbnNvbGUubG9nLmJpbmQodGhpcywgXCJwaW5nIHVwZGF0ZSByYW4gZHVlIHRvIDAgbGFzdFVwZGF0ZVwiKSk7XG5cdH1cblx0aWYgKHRoaXMuaHR0cC5sYXN0VXBkYXRlID09PSAwIHx8IHRoaXMuaHR0cC5zdGF0ZSA9PT0gLTEgfHwgdGhpcy5odHRwLnN0YXRlID09PSAtMikge1xuXHRcdHRoaXMuaHR0cC5nZXRSZW1vdGUoY29uc29sZS5sb2cuYmluZCh0aGlzLCBcImh0dHAgdXBkYXRlIHJhbiBkdWUgdG8gMCBsYXN0VXBkYXRlXCIpKTtcblx0fVxuXHQvKmlmICh0aGlzLmNoaWxkcmVuLmxhc3RVcGRhdGUgPT09IDAgfHwgdGhpcy5jaGlsZHJlbi5zdGF0ZSA9PT0gLTEgfHwgdGhpcy5jaGlsZHJlbi5zdGF0ZSA9PT0gLTIpIHtcblx0XHR0aGlzLmNoaWxkcmVuLmdldFJlbW90ZShjb25zb2xlLmxvZy5iaW5kKHRoaXMsIFwiY2hpbGRyZW4gdXBkYXRlIHJhbiBkdWUgdG8gMCBsYXN0VXBkYXRlXCIpKTtcblx0fSovXG59XG5Eb21haW5MaXN0SXRlbS5wcm90b3R5cGUuZm9ybWF0UGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5waW5nLnN0YXRlICE9PSAwIHx8IHRoaXMucGluZy52YWx1ZSA9PSB1bmRlZmluZWQpIHJldHVybiBcIi0tLS0tXCI7XG4gICAgdmFyIHN1ZmZpeCA9IFwibXNcIjtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnBpbmcudmFsdWU7XG4gICAgaWYgKHZhbHVlIDwgMTAwMCkgc3VmZml4ID0gXCImIzk1NjtzXCI7XG4gICAgZWxzZSBpZiAodmFsdWUgPCAxMDAwMCkge1xuICAgICAgICB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUgLyAxMDApIC8gMTA7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gcGFyc2VJbnQodmFsdWUpKSB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCkgKyBcIi4wXCJcbiAgICB9IGVsc2UgaWYgKHZhbHVlIDwgMTAwMDAwMCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlIC8gMTAwMCk7XG4gICAgZWxzZSB7XG4gICAgICAgIHZhbHVlID0gTWF0aC5mbG9vcih2YWx1ZSAvIDEwMDAwMDApO1xuICAgICAgICBzdWZmaXggPSBcInNcIjtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IHZhbHVlLnRvU3RyaW5nKCkgKyBzdWZmaXg7XG4gICAgcmV0dXJuIHJlc3VsdC5wYWRTdGFydCg1LCBcIiBcIik7XG59XG5Eb21haW5MaXN0SXRlbS5wcm90b3R5cGUuZm9ybWF0SHR0cCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5odHRwLnN0YXRlICE9PSAwIHx8IHRoaXMuaHR0cC52YWx1ZSA9PSB1bmRlZmluZWQpIHJldHVybiBcIi0tLS1cIjtcbiAgICByZXR1cm4gXCIgXCIgKyB0aGlzLmh0dHAudmFsdWUudG9TdHJpbmcoKTtcbn1cbkRvbWFpbkxpc3RJdGVtLnByb3RvdHlwZS5mb3JtYXREbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZG5zLnN0YXRlICE9PSAwIHx8IHRoaXMuZG5zLnZhbHVlID09IHVuZGVmaW5lZCkgcmV0dXJuIFwiLS0tLS1cIjtcbiAgICB2YXIgcmVzdWx0ID0gXCJcIjtcbiAgICByZXN1bHQgKz0gdGhpcy5kbnMudmFsdWVbXCJBXCJdICAgICA9PSB1bmRlZmluZWQgPyBcIiBcIiA6IFwiNFwiO1xuICAgIHJlc3VsdCArPSB0aGlzLmRucy52YWx1ZVtcIkFBQUFcIl0gID09IHVuZGVmaW5lZCA/IFwiIFwiIDogXCI2XCI7XG4gICAgcmVzdWx0ICs9IHRoaXMuZG5zLnZhbHVlW1wiQ05BTUVcIl0gPT0gdW5kZWZpbmVkID8gXCIgXCIgOiBcIkNcIjtcbiAgICByZXN1bHQgKz0gdGhpcy5kbnMudmFsdWVbXCJNWFwiXSAgICA9PSB1bmRlZmluZWQgPyBcIiBcIiA6IFwiTVwiO1xuICAgIHJlc3VsdCArPSB0aGlzLmRucy52YWx1ZVtcIlRYVFwiXSAgID09IHVuZGVmaW5lZCA/IFwiIFwiIDogXCJUXCI7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbkRvbWFpbkxpc3RJdGVtLnByb3RvdHlwZS5mb3JtYXREYXRlID0gZnVuY3Rpb24gKHRpbWVzdGFtcCkge1xuXHRpZiAodGltZXN0YW1wID09PSAwKSByZXR1cm4gXCJTdGlsbCBDaGVja2luZ1wiO1xuXHR2YXIgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdHJldHVybiAoZGF0ZS5nZXRVVENGdWxsWWVhcigpLTIwMDApLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpICsgXCIvXCIgKyBkYXRlLmdldFVUQ01vbnRoKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCBcIjBcIikgKyBcIi9cIiArIGRhdGUuZ2V0VVRDRGF0ZSgpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpICsgXCIgXCIgKyBkYXRlLmdldFVUQ0hvdXJzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCBcIjBcIikgKyBcIjpcIiArIGRhdGUuZ2V0VVRDTWludXRlcygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpO1xufVxuRG9tYWluTGlzdEl0ZW0ucHJvdG90eXBlLmdldFggPSBmdW5jdGlvbiAoZW5kcG9pbnQsIGNhbGxiYWNrKSB7IFxuXHR2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cdHJlcS5vcGVuKFwiUFVUXCIsIGVuZHBvaW50KTtcblx0cmVxLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IChmdW5jdGlvbiAoY2FsbGJhY2spIHtcblx0XHRpZiAodGhpcy5yZWFkeVN0YXRlID09PSA0KSB7XG5cdFx0XHRjYWxsYmFjayhyZXEucmVzcG9uc2UpO1xuXHRcdH1cblx0fSkuYmluZChyZXEsIGNhbGxiYWNrKTtcblx0cmVxLnNlbmQoKTtcbn1cbkRvbWFpbkxpc3RJdGVtLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAobmV3SnNvbikge1xuXHRmb3IgKHZhciBpbmRleCBpbiBuZXdKc29uKSB7XG5cdFx0aWYgKG5ld0pzb25baW5kZXhdICE9PSB0aGlzW2luZGV4XSkge1xuXHRcdFx0dGhpcy51cGRhdGVLZXlbaW5kZXhdKG5ld0pzb25baW5kZXhdKTtcblx0XHR9XG5cdH1cbn1cbkRvbWFpbkxpc3RJdGVtLnByb3RvdHlwZS5jb2xvckNvZGUgPSB7XG5cdFwiLTFcIjogXCIjQ0REQzM5XCIsXG5cdFwiMFwiOiBcIiM0Q0FGNTBcIixcblx0XCIxXCI6IFwiI0ZGNTcyMlwiLFxufVxuRG9tYWluTGlzdEl0ZW0ucHJvdG90eXBlLnNldERucyA9IGZ1bmN0aW9uIChuZXdEbnMpIHtcblx0aWYgKG5ld0RucyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhpcy5kbnMudmFsdWUgPSBuZXdEbnMudmFsdWUgIT09IHVuZGVmaW5lZCA/IG5ld0Rucy52YWx1ZSA6IHRoaXMuZG5zLnZhbHVlO1xuXHRcdHRoaXMuZG5zLnN0YXRlID0gbmV3RG5zLnN0YXRlICE9PSB1bmRlZmluZWQgPyBuZXdEbnMuc3RhdGUgOiB0aGlzLmRucy5zdGF0ZTtcblx0XHR0aGlzLmRucy5sYXN0VXBkYXRlID0gbmV3RG5zLmxhc3RVcGRhdGUgIT09IHVuZGVmaW5lZCA/IG5ld0Rucy5sYXN0VXBkYXRlIDogdGhpcy5kbnMubGFzdFVwZGF0ZTtcblx0fVxuXHR0aGlzLm5vZGVzLmRucy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmNvbG9yQ29kZVt0aGlzLmRucy5zdGF0ZV07XG4gICAgdGhpcy5ub2Rlcy5kbnMuaW5uZXJIVE1MID0gdGhpcy5mb3JtYXREbnMoKTtcblx0Ly90aGlzLm5vZGVzLmRuc0xhc3RDaGVjay5pbm5lckhUTUwgPSBcIkROUyBMYXN0IENoZWNrZWQ6IFwiICsgdGhpcy5mb3JtYXREYXRlKHRoaXMuZG5zLmxhc3RVcGRhdGUpO1xuXHRpZiAodGhpcy5mb2N1c2VkID09PSB0cnVlKSB0aGlzLmluZm9PdXRwdXQuc2V0RG5zKHRoaXMuZG5zLnN0YXRlLCB0aGlzLmZvcm1hdERhdGUodGhpcy5kbnMubGFzdFVwZGF0ZSkpO1xufVxuRG9tYWluTGlzdEl0ZW0ucHJvdG90eXBlLnNldENoaWxkcmVuID0gZnVuY3Rpb24gKG5ld0NoaWxkcmVuKSB7XG4gICAgaWYgKG5ld0NoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcblx0XHR0aGlzLmNoaWxkcmVuLnZhbHVlID0gbmV3Q2hpbGRyZW4udmFsdWUgIT09IHVuZGVmaW5lZCA/IG5ld0NoaWxkcmVuLnZhbHVlIDogdGhpcy5jaGlsZHJlbi52YWx1ZTtcblx0XHR0aGlzLmNoaWxkcmVuLnN0YXRlID0gbmV3Q2hpbGRyZW4uc3RhdGUgIT09IHVuZGVmaW5lZCA/IG5ld0NoaWxkcmVuLnN0YXRlIDogdGhpcy5jaGlsZHJlbi5zdGF0ZTtcblx0XHR0aGlzLmNoaWxkcmVuLmxhc3RVcGRhdGUgPSBuZXdDaGlsZHJlbi5sYXN0VXBkYXRlICE9PSB1bmRlZmluZWQgPyBuZXdDaGlsZHJlbi5sYXN0VXBkYXRlIDogdGhpcy5jaGlsZHJlbi5sYXN0VXBkYXRlO1xuICAgIH1cbn1cbkRvbWFpbkxpc3RJdGVtLnByb3RvdHlwZS5zZXRQaW5nID0gZnVuY3Rpb24gKG5ld1BpbmcpIHtcblx0aWYgKG5ld1BpbmcgIT09IHVuZGVmaW5lZCkge1xuXHRcdHRoaXMucGluZy52YWx1ZSA9IG5ld1BpbmcudmFsdWUgIT09IHVuZGVmaW5lZCA/IG5ld1BpbmcudmFsdWUgOiB0aGlzLnBpbmcudmFsdWU7XG5cdFx0dGhpcy5waW5nLnN0YXRlID0gbmV3UGluZy5zdGF0ZSAhPT0gdW5kZWZpbmVkID8gbmV3UGluZy5zdGF0ZSA6IHRoaXMucGluZy5zdGF0ZTtcblx0XHR0aGlzLnBpbmcubGFzdFVwZGF0ZSA9IG5ld1BpbmcubGFzdFVwZGF0ZSAhPT0gdW5kZWZpbmVkID8gbmV3UGluZy5sYXN0VXBkYXRlIDogdGhpcy5waW5nLmxhc3RVcGRhdGU7XG5cdH1cblx0dGhpcy5ub2Rlcy5waW5nLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IHRoaXMuY29sb3JDb2RlW3RoaXMucGluZy5zdGF0ZV07XG4gICAgdGhpcy5ub2Rlcy5waW5nLmlubmVySFRNTCA9IHRoaXMuZm9ybWF0UGluZygpO1xuXHQvL3RoaXMubm9kZXMucGluZ0xhc3RDaGVjay5pbm5lckhUTUwgPSBcIlBpbmcgTGFzdCBDaGVja2VkOiBcIiArIHRoaXMuZm9ybWF0RGF0ZSh0aGlzLnBpbmcubGFzdFVwZGF0ZSk7XG5cdGlmICh0aGlzLmZvY3VzZWQgPT09IHRydWUpIHRoaXMuaW5mb091dHB1dC5zZXRQaW5nKHRoaXMucGluZy5zdGF0ZSwgdGhpcy5mb3JtYXREYXRlKHRoaXMucGluZy5sYXN0VXBkYXRlKSk7XG59XG5Eb21haW5MaXN0SXRlbS5wcm90b3R5cGUuc2V0SHR0cCA9IGZ1bmN0aW9uIChuZXdIdHRwKSB7XG5cdGlmIChuZXdIdHRwICE9PSB1bmRlZmluZWQpIHtcblx0XHR0aGlzLmh0dHAudmFsdWUgPSBuZXdIdHRwLnZhbHVlICE9PSB1bmRlZmluZWQgPyBuZXdIdHRwLnZhbHVlIDogdGhpcy5odHRwLnZhbHVlO1xuXHRcdHRoaXMuaHR0cC5zdGF0ZSA9IG5ld0h0dHAuc3RhdGUgIT09IHVuZGVmaW5lZCA/IG5ld0h0dHAuc3RhdGUgOiB0aGlzLmh0dHAuc3RhdGU7XG5cdFx0dGhpcy5odHRwLmxhc3RVcGRhdGUgPSBuZXdIdHRwLmxhc3RVcGRhdGUgIT09IHVuZGVmaW5lZCA/IG5ld0h0dHAubGFzdFVwZGF0ZSA6IHRoaXMuaHR0cC5sYXN0VXBkYXRlO1xuXHR9XG5cdHRoaXMubm9kZXMuaHR0cC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmNvbG9yQ29kZVt0aGlzLmh0dHAuc3RhdGVdO1xuICAgIHRoaXMubm9kZXMuaHR0cC5pbm5lckhUTUwgPSB0aGlzLmZvcm1hdEh0dHAoKTtcblx0Ly90aGlzLm5vZGVzLmh0dHBMYXN0Q2hlY2suaW5uZXJIVE1MID0gXCJIVFRQIExhc3QgQ2hlY2tlZDogXCIgKyB0aGlzLmZvcm1hdERhdGUodGhpcy5odHRwLmxhc3RVcGRhdGUpO1xuXHRpZiAodGhpcy5mb2N1c2VkID09PSB0cnVlKSB0aGlzLmluZm9PdXRwdXQuc2V0SHR0cCh0aGlzLmh0dHAuc3RhdGUsIHRoaXMuZm9ybWF0RGF0ZSh0aGlzLmh0dHAubGFzdFVwZGF0ZSkpO1xufVxuRG9tYWluTGlzdEl0ZW0ucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMubm9kZXMucm9vdC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cdHRoaXMuaGlkZGVuID0gdHJ1ZTtcbn1cbkRvbWFpbkxpc3RJdGVtLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLm5vZGVzLnJvb3Quc3R5bGUuZGlzcGxheSA9IFwiXCI7XG5cdHRoaXMuaGlkZGVuID0gZmFsc2U7XG59XG5Eb21haW5MaXN0SXRlbS5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuXHRpZiAodGhpcy5oaWRkZW4pIHRoaXMuc2hvdygpO1xuXHRlbHNlIHRoaXMuaGlkZSgpO1xufVxudmFyIERvbWFpbkxpc3QgPSBmdW5jdGlvbiAoaWQsIHNlYXJjaElkLCBzdWJtaXRJZCwgZmVlZGJhY2tJZCwgdXBkYXRlSWQsIGRvbWFpbkNvdW50SWQsIGluZm9JZCwgbG9nSWQsIGNhbGxiYWNrKSB7XG5cdC8qXG5cdHN0YXRlIC0yOiBHZXR0aW5nIHNlcnZlciBkb21haW4gbGlzdC5cblx0c3RhdGUgLTE6IFF1ZXJ5aW5nIGFib3V0IG9uZSBkb21haW4uXG5cdHN0YXRlIDA6IFRoZSBkb21haW4gaXMgbGVnaXRpbWF0ZS5cblx0c3RhdGUgMTogVGhlIGRvbWFpbiBpcyBhbHJlYWR5IGluIHRoZSByZW1vdGUgbGlzdC5cblx0c3RhdGUgMjogVGhlIGRvbWFpbiBoYXMgbm8gZG5zIGxvb2t1cC5cblx0c3RhdGUgMzogVGhlIGRvbWFpbiBkb2VzIG5vdCBtZWV0IHRoZSByZWd1bGFyIGV4cHJlc3Npb24gc3RhbmRhcmQuXG5cdHN0YXRlIDQ6IFRoZSBzZXJ2ZXIgcmV0dXJuZWQgaXRzIGRvbWFpbiBsaXN0LlxuXHRzdGF0ZSA1OiBUaGUgc2VydmVyIGRpZCBub3QgcmV0dXJuIGEgZG9tYWluIGxpc3QuXG5cdCovXG5cdHRoaXMubm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblx0dGhpcy5zZWFyY2hOb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VhcmNoSWQpOyBcblx0dGhpcy5zZWFyY2hOb2RlLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCB0aGlzLnNlYXJjaERvbWFpbkl0ZW1zLmJpbmQodGhpcykpO1xuXHR0aGlzLmVudHJpZXMgPSB7fTtcblx0dGhpcy5vcmRlcmVkRG9tYWlucyA9IFtdO1xuXHR0aGlzLmlucHV0Tm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN1Ym1pdElkKTtcblx0dGhpcy5pbnB1dE5vZGUuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5oYW5kbGVJbnB1dEtleXMuYmluZCh0aGlzKSk7XG5cdHRoaXMuZG9tYWluQ291bnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkb21haW5Db3VudElkKTtcblx0dGhpcy5pbmZvID0gbmV3IERvbWFpbkluZm8oZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaW5mb0lkKSwgdGhpcyk7XG5cdHRoaXMuc3RhdGUgPSAwO1xuXHR0aGlzLnN0YWdpbmdBcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFnaW5nQXJlYVwiKTtcblx0dGhpcy5mZWVkYmFjayA9IHtcblx0XHRub2RlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChmZWVkYmFja0lkKSxcblx0XHRzdGF0ZVRleHRzOiB7XG5cdFx0XHRcIi0zXCI6IFwiUmVuZGVyaW5nIG5ldyBsaXN0IG9mIGRvbWFpbnMuLi5cIixcblx0XHRcdFwiLTJcIjogXCJRdWVyeWluZyBzZXJ2ZXIgZm9yIGxpc3Qgb2YgZG9tYWlucy4uLlwiLFxuXHRcdFx0XCItMVwiOiBcIlF1ZXJ5aW5nIHNlcnZlciBhYm91dCBzdWJtaXR0ZWQgZG9tYWluLi4uXCIsXG5cdFx0XHRcIjBcIjogIFwiRG9tYWluKHMpIGZvdW5kIGFuZCBhZGRlZC5cIixcblx0XHRcdFwiMVwiOiAgXCJEb21haW4gaXMgYWxyZWFkeSBpbiB0aGUgbGlzdC5cIixcblx0XHRcdFwiMlwiOiAgXCJEb21haW4gaGFzIG5vIEROUyBlbnRyeS5cIixcblx0XHRcdFwiM1wiOiAgXCJEb21haW4gaXMgbm90IGEgc3ViZG9tYWluIG9mIGVkLmFjLnVrLlwiLFxuXHRcdFx0XCI0XCI6ICBcIkxpc3Qgb2YgZG9tYWlucyBmb3VuZCBhbmQgcmVuZGVyZWQuXCIsXG5cdFx0XHRcIjVcIjogIFwiQ291bGQgbm90IGdldCB0aGUgZG9tYWluIGxpc3QgZnJvbSBzZXJ2ZXIuXCJcblx0XHR9LFxuXHRcdHN0YXRlQ2xhc3Nlczoge1xuXHRcdFx0XCItM1wiOiBcInllbGxvd1wiLFxuXHRcdFx0XCItMlwiOiBcInllbGxvd1wiLFxuXHRcdFx0XCItMVwiOiBcInllbGxvd1wiLFxuXHRcdFx0XCIwXCI6ICBcImdyZWVuXCIsXG5cdFx0XHRcIjFcIjogIFwiYmx1ZVwiLFxuXHRcdFx0XCIyXCI6ICBcInJlZFwiLFxuXHRcdFx0XCIzXCI6ICBcInJlZFwiLFxuXHRcdFx0XCI0XCI6ICBcImdyZWVuXCIsXG5cdFx0XHRcIjVcIjogIFwieWVsbG93XCJcblx0XHR9LFxuXHRcdHNldFN0YXRlOiBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gXCIwXCIgfHwgc3RhdGUgPT09IDApIHRoaXMuY291bnRTb0ZhciArPSAxO1xuXG5cdFx0XHR0aGlzLm5vZGUuaW5uZXJIVE1MID0gKHN0YXRlID09PSBcIjBcIiB8fCBzdGF0ZSA9PT0gMCA/IHRoaXMuY291bnRTb0Zhci50b1N0cmluZygpICsgXCIgXCIgOiBcIlwiKSArIHRoaXMuc3RhdGVUZXh0c1tzdGF0ZV07XG4gICAgICAgICAgICB0aGlzLm5vZGUuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLnN0YXRlQ2xhc3Nlc1t0aGlzLnN0YXRlXSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgICAgIHRoaXMubm9kZS5jbGFzc0xpc3QuYWRkKHRoaXMuc3RhdGVDbGFzc2VzW3RoaXMuc3RhdGVdKTtcblx0XHR9LFxuICAgICAgICBzdGF0ZTogLTMsXG4gICAgICAgIGNvdW50U29GYXI6IDBcblx0fVxuICAgIHRoaXMubG9nID0gbmV3IExvZyhsb2dJZCk7XG5cdHRoaXMudXBkYXRlTm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHVwZGF0ZUlkKTtcblx0dGhpcy51cGRhdGVOb2RlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmdldFJlbW90ZURvbWFpbnMuYmluZCh0aGlzKSk7XG5cdHRoaXMuaW5pdERvbmUgPSBmYWxzZTtcblx0dGhpcy5pbml0Q2FsbGJhY2sgPSBjYWxsYmFjaztcblx0dGhpcy5hbGxTaG93biA9IHRydWU7XG5cdHRoaXMuZ2V0UmVtb3RlRG9tYWlucygpO1xufVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KERvbWFpbkxpc3QucHJvdG90eXBlLCBcInNlYXJjaFwiLCB7XG5cdFwiZ2V0XCI6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5zZWFyY2hOb2RlLnZhbHVlO1xuXHR9LFxuXHRcInNldFwiOiBmdW5jdGlvbiAobmV3U2VhcmNoKSB7XG5cdFx0dGhpcy5zZWFyY2hOb2RlLnZhbHVlID0gbmV3U2VhcmNoO1xuXHR9XG59KTtcbkRvbWFpbkxpc3QucHJvdG90eXBlLnNldFN0YXRlID0gZnVuY3Rpb24gKHN0YXRlKSB7XG5cdHRoaXMuc3RhdGUgPSBzdGF0ZTtcblx0dGhpcy5mZWVkYmFjay5zZXRTdGF0ZShzdGF0ZSk7XG59XG5Eb21haW5MaXN0LnByb3RvdHlwZS5oYW5kbGVJbnB1dEtleXMgPSBmdW5jdGlvbiAoZSkge1xuXHRpZiAoZS5rZXlDb2RlID09PSAxMykge1xuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR0aGlzLnN1Ym1pdERvbWFpbnModGhpcy5pbnB1dE5vZGUudmFsdWUpO1xuXHR9XG59XG5Eb21haW5MaXN0LnByb3RvdHlwZS5maW5kT3JkZXJlZEluZGV4ID0gZnVuY3Rpb24gKGRvbWFpbiwgc3Vic2V0TGVmdCwgc3Vic2V0UmlnaHQpIHtcblx0c3Vic2V0TGVmdCA9IHN1YnNldExlZnQgIT09IHVuZGVmaW5lZCA/IHN1YnNldExlZnQgOiAwO1xuXHRzdWJzZXRSaWdodCA9IHN1YnNldFJpZ2h0ICE9PSB1bmRlZmluZWQgPyBzdWJzZXRSaWdodCA6IHRoaXMub3JkZXJlZERvbWFpbnMubGVuZ3RoO1xuXHR3aGlsZSAoc3Vic2V0TGVmdCAhPT0gc3Vic2V0UmlnaHQpIHtcblx0XHR2YXIgY2hlY2tEb21haW4gPSB0aGlzLm9yZGVyZWREb21haW5zW3N1YnNldExlZnQgKyBNYXRoLmZsb29yKChzdWJzZXRSaWdodCAtIHN1YnNldExlZnQpIC8gMildO1xuXHRcdGlmIChjaGVja0RvbWFpbiA+IGRvbWFpbikgc3Vic2V0UmlnaHQgPSBzdWJzZXRMZWZ0ICsgTWF0aC5mbG9vcigoc3Vic2V0UmlnaHQgLSBzdWJzZXRMZWZ0KSAvIDIpO1xuXHRcdGVsc2Ugc3Vic2V0TGVmdCA9IHN1YnNldFJpZ2h0IC0gTWF0aC5mbG9vcigoc3Vic2V0UmlnaHQgLSBzdWJzZXRMZWZ0KSAvIDIpO1xuXHR9XG5cdHJldHVybiBzdWJzZXRMZWZ0O1xufVxuRG9tYWluTGlzdC5wcm90b3R5cGUuYWRkRG9tYWluSXRlbSA9IGZ1bmN0aW9uIChyZXNKc29uKSB7XG5cdGlmICh0aGlzLmVudHJpZXNbcmVzSnNvbi5uYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFyIG9yZGVyZWRJbmRleCA9IHRoaXMuZmluZE9yZGVyZWRJbmRleChyZXNKc29uLm5hbWUpO1xuXHRcdHRoaXMub3JkZXJlZERvbWFpbnMuc3BsaWNlKG9yZGVyZWRJbmRleCwgMCwgcmVzSnNvbi5uYW1lKTtcblx0XHR0aGlzLmVudHJpZXNbcmVzSnNvbi5uYW1lXSA9IG5ldyBEb21haW5MaXN0SXRlbShyZXNKc29uLCB0aGlzLmluZm8pO1xuXHRcdHRoaXMuc3RhZ2luZ0FyZWEuaW5uZXJIVE1MID0gdGhpcy5lbnRyaWVzW3Jlc0pzb24ubmFtZV0uZG9tU3RyaW5nKCk7XG5cdFx0dGhpcy5lbnRyaWVzW3Jlc0pzb24ubmFtZV0uaW5pdGlhbGl6ZU5vZGVzKHRoaXMuc3RhZ2luZ0FyZWEuY2hpbGRyZW5bMF0pO1xuXHRcdGlmICh0aGlzLm5vZGUuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XG5cdFx0XHR0aGlzLm5vZGUuYXBwZW5kQ2hpbGQodGhpcy5lbnRyaWVzW3Jlc0pzb24ubmFtZV0ubm9kZXMucm9vdCk7XG5cdFx0fSBlbHNlIGlmIChvcmRlcmVkSW5kZXggPT09IHRoaXMubm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcblx0XHRcdHRoaXMubm9kZS5hcHBlbmRDaGlsZCh0aGlzLmVudHJpZXNbcmVzSnNvbi5uYW1lXS5ub2Rlcy5yb290KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5ub2RlLmluc2VydEJlZm9yZSh0aGlzLmVudHJpZXNbcmVzSnNvbi5uYW1lXS5ub2Rlcy5yb290LCB0aGlzLm5vZGUuY2hpbGRyZW5bb3JkZXJlZEluZGV4XSk7XG5cdFx0fVxuXHRcdHRoaXMuc3RhZ2luZ0FyZWEuaW5uZXJIVE1MID0gXCJcIjtcblx0XHR0aGlzLnNlYXJjaERvbWFpbkl0ZW1zKCk7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5lbnRyaWVzW3Jlc0pzb24ubmFtZV0udXBkYXRlKHJlc0pzb24pO1xuXHR9XG59XG5Eb21haW5MaXN0LnByb3RvdHlwZS5zdWJtaXREb21haW5zID0gZnVuY3Rpb24gKG5hbWVzLCBjYWxsYmFjaykge1xuXHRpZiAodGhpcy5zdGF0ZSA+PSAwKSB7XG5cdFx0dGhpcy5mZWVkYmFjay5zZXRTdGF0ZSgtMSk7XG5cdFx0dmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXHRcdHJlcS5vcGVuKFwiUE9TVFwiLCBcIi92MS9kb21haW5zXCIpO1xuICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiKTtcblx0XHRyZXEub25yZWFkeXN0YXRlY2hhbmdlID0gKGZ1bmN0aW9uIChyZXEpIHtcblx0XHRcdGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gNCkge1xuXHRcdFx0XHR0aGlzLnNlcnZlclJlc3BvbnNlQ29udHJvbChyZXEucmVzcG9uc2UpO1xuXHRcdFx0fVxuXHRcdH0pLmJpbmQodGhpcywgcmVxKTtcblx0XHRyZXEuc2VuZChcIm5hbWVzPVwiICsgbmFtZXMpO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnNvbGUubG9nKFwiU3RhdGUgYWxyZWFkeSBydW5uaW5nLCB3YWl0IHVudGlsIGxhdGVyLlwiKTtcblx0fVxufVxuRG9tYWluTGlzdC5wcm90b3R5cGUuZ2V0UmVtb3RlRG9tYWlucyA9IGZ1bmN0aW9uICgpIHtcblx0aWYgKHRoaXMuc3RhdGUgPj0gMCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoLTIpO1xuXHRcdHRoaXMuaW5mby5yZXNldEZvY3VzKCk7XG5cdFx0dmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXHRcdHJlcS5vcGVuKFwiR0VUXCIsIFwiL3YxL2RvbWFpbnM/dD1cIiArIERhdGUubm93KCkudG9TdHJpbmcoMzYpKTtcblx0XHRyZXEub25yZWFkeXN0YXRlY2hhbmdlID0gKGZ1bmN0aW9uIChyZXEpIHtcblx0XHRcdGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gNCkge1xuXHRcdFx0XHR0aGlzLnNldFJlbW90ZURvbWFpbnMocmVxLnJlc3BvbnNlKTtcblx0XHRcdH1cblx0XHR9KS5iaW5kKHRoaXMsIHJlcSk7XG5cdFx0cmVxLnNlbmQoKTtcblx0fSBlbHNlIGNvbnNvbGUubG9nKFwiU3RhdGUgYWxyZWFkeSBydW5uaW5nLCB3YWl0IHVudGlsIGxhdGVyLlwiKTtcbn1cbkRvbWFpbkxpc3QucHJvdG90eXBlLnNldFJlbW90ZURvbWFpbnMgPSBmdW5jdGlvbiAocmVzKSB7XG5cdHRyeSB7XG5cdFx0dmFyIHJlc0pzb24gPSBKU09OLnBhcnNlKHJlcyk7XG5cdFx0dGhpcy5vcmRlcmVkRG9tYWlucyA9IFtdO1xuXHRcdHRoaXMuZW50cmllcyA9IHt9O1xuXHRcdGZvciAodmFyIGlpID0gMDsgaWkgPCByZXNKc29uLmxlbmd0aDsgaWkrKykge1xuXHRcdFx0dGhpcy5vcmRlcmVkRG9tYWlucy5wdXNoKHJlc0pzb25baWldLm5hbWUpO1xuXHRcdFx0dGhpcy5lbnRyaWVzW3Jlc0pzb25baWldLm5hbWVdID0gbmV3IERvbWFpbkxpc3RJdGVtKHJlc0pzb25baWldLCB0aGlzLmluZm8pO1xuXHRcdH1cblx0XHR0aGlzLmFsbFNob3duID0gZmFsc2U7XG5cdFx0dGhpcy5zZWFyY2hEb21haW5JdGVtcygpO1xuXHRcdGlmICh0aGlzLmluaXREb25lID09PSBmYWxzZSkge1xuXHRcdFx0dGhpcy5pbml0RG9uZSA9IHRydWU7XG5cdFx0XHR0aGlzLmluaXRDYWxsYmFjaygpO1xuXHRcdH1cdFxuXHR9IGNhdGNoIChlKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSg1KTtcblx0XHRjb25zb2xlLmxvZyhlLCBcIklsbGVnaXRpbWF0ZSBvdXRwdXQgZnJvbSBzZXJ2ZXIgb24gL2RvbWFpbnMgZW5kcG9pbnQuXCIpO1xuXHR9XG59XG5Eb21haW5MaXN0LnByb3RvdHlwZS5zZXRNYXJrdXAgPSBmdW5jdGlvbiAoZG9tYWlucykge1xuXHR0aGlzLnNldFN0YXRlKC0zKTtcblx0dmFyIG1hcmt1cCA9IFtdO1xuXHRmb3IgKHZhciBpaSA9IDA7IGlpIDwgZG9tYWlucy5sZW5ndGg7IGlpKyspIG1hcmt1cC5wdXNoKHRoaXMuZW50cmllc1tkb21haW5zW2lpXV0uZG9tU3RyaW5nKCkpO1xuXHR0aGlzLm5vZGUuaW5uZXJIVE1MID0gbWFya3VwLmpvaW4oXCJcIik7XG5cdGZvciAodmFyIGlpID0gMDsgaWkgPCBkb21haW5zLmxlbmd0aDsgaWkrKykgdGhpcy5lbnRyaWVzW2RvbWFpbnNbaWldXS5pbml0aWFsaXplTm9kZXModGhpcy5ub2RlLmNoaWxkcmVuW2lpXSk7XG5cdHRoaXMuc2V0U3RhdGUoNCk7XG59XG5Eb21haW5MaXN0LnByb3RvdHlwZS5zZXJ2ZXJSZXNwb25zZUNvbnRyb2wgPSBmdW5jdGlvbiAocmVzKSB7XG5cdHRyeSB7XG4gICAgICAgIHZhciByZXMgPSBKU09OLnBhcnNlKHJlcyk7XG4gICAgICAgIHZhciBzaW5nbGVSZXM7XG4gICAgICAgIHZhciByZXNMZW5ndGggPSByZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgcmVzTGVuZ3RoOyBpaSsrKSB7XG4gICAgICAgICAgICBzaW5nbGVSZXMgPSByZXNbaWldO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzaW5nbGVSZXMuc3RhdGUpO1xuICAgICAgICAgICAgdGhpcy5sb2cuYWRkKHNpbmdsZVJlcyk7XG4gICAgICAgICAgICBpZiAoc2luZ2xlUmVzLnN0YXRlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGREb21haW5JdGVtKHNpbmdsZVJlcy5kYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAoc2luZ2xlUmVzLmRhdGEuY2hpbGRyZW4uc3RhdGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaWkgaW4gdGhpcy5jaGlsZHJlbi52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmNoaWxkcmVuLnZhbHVlW2lpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3VibWl0RG9tYWlucyhuZXdOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXHR9IGNhdGNoIChlKSB7XG5cdFx0Y29uc29sZS5sb2coZSwgXCJJbGxlZ2l0aW1hdGUgb3V0cHV0IGZyb20gc2VydmVyIG9uIC9hZGQgZW5kcG9pbnQuXCIpO1xuXHR9XG59XG5Eb21haW5MaXN0LnByb3RvdHlwZS5zZWFyY2hEb21haW5JdGVtcyA9IGZ1bmN0aW9uIChlKSB7XG5cdGlmIChlICE9PSB1bmRlZmluZWQgJiYgZS5rZXlDb2RlICE9PSAxMykgcmV0dXJuO1xuXHRpZiAodGhpcy5zZWFyY2ggPT09IFwiXCIpIHtcblx0XHRpZiAodGhpcy5hbGxTaG93biAhPT0gdHJ1ZSkge1xuXHRcdFx0dGhpcy5hbGxTaG93biA9IHRydWU7XG5cdFx0XHR0aGlzLnNldE1hcmt1cCh0aGlzLm9yZGVyZWREb21haW5zKTtcblx0XHR9XG5cdFx0dGhpcy5kb21haW5Db3VudC5pbm5lckhUTUwgPSB0aGlzLm9yZGVyZWREb21haW5zLmxlbmd0aCArIFwiL1wiICsgdGhpcy5vcmRlcmVkRG9tYWlucy5sZW5ndGg7XG5cdH0gZWxzZSB7XG5cdFx0dHJ5IHtcblx0XHRcdHZhciByZWdleCA9IG5ldyBSZWdFeHAodGhpcy5zZWFyY2gpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGNvbnNvbGUubG9nKGUpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR2YXIgZW50cmllc0V4aXN0ID0gMDtcblx0XHR2YXIgZW50cmllc1Nob3duID0gMDtcblx0XHR2YXIgc2hvd2luZ0RvbWFpbnMgPSBbXTtcblx0XHRmb3IgKHZhciBpaSA9IDA7IGlpIDwgdGhpcy5vcmRlcmVkRG9tYWlucy5sZW5ndGg7IGlpKyspIHtcblx0XHRcdHZhciBkb21haW4gPSB0aGlzLm9yZGVyZWREb21haW5zW2lpXTtcblx0XHRcdHZhciBzdWJkb21haW4gPSB0aGlzLmVudHJpZXNbZG9tYWluXS5kb21haW4gPT09IFwiZWQuYWMudWtcIiA/IFwiZWQuYWMudWtcIiA6IHRoaXMuZW50cmllc1tkb21haW5dLnN1YmRvbWFpbjtcblx0XHRcdGlmIChzdWJkb21haW4gPT09IHVuZGVmaW5lZCkgY29udGludWU7XG5cdFx0XHRpZiAocmVnZXgudGVzdChzdWJkb21haW4pKSB7XG5cdFx0XHRcdGVudHJpZXNTaG93bisrO1xuXHRcdFx0XHRzaG93aW5nRG9tYWlucy5wdXNoKGRvbWFpbik7XG5cdFx0XHR9XG5cdFx0XHRlbnRyaWVzRXhpc3QrKztcblx0XHR9XG5cdFx0dGhpcy5zZXRNYXJrdXAoc2hvd2luZ0RvbWFpbnMpO1xuXHRcdHRoaXMuZG9tYWluQ291bnQuaW5uZXJIVE1MID0gZW50cmllc1Nob3duLnRvU3RyaW5nKCkgKyBcIi9cIiArIGVudHJpZXNFeGlzdC50b1N0cmluZygpO1xuXHRcdGlmIChlbnRyaWVzRXhpc3QgIT09IGVudHJpZXNTaG93bikgdGhpcy5hbGxTaG93biA9IGZhbHNlO1xuXHRcdGVsc2UgdGhpcy5hbGxTaG93biA9IHRydWU7XG5cdH1cbn1cblxudmFyIERvbWFpbkluZm8gPSBmdW5jdGlvbiAobm9kZSwgbGlzdCkge1xuXHR0aGlzLnN0YXRlTGlzdCA9IHtcblx0XHRcIi0xXCI6IFtcIlByb2Nlc3NpbmcuLi5cIiwgXCIjQ0REQzM5XCJdLFxuXHRcdFwiMFwiOiBbXCJTdWNjZXNzLlwiLCBcIiM0Q0FGNTBcIl0sXG5cdFx0XCIxXCI6IFtcIkZhaWxlZC5cIiwgXCIjRkY1NzIyXCJdXG5cdH1cblx0dGhpcy5mb2N1cyA9IHVuZGVmaW5lZDtcblx0dGhpcy5ub2RlID0gbm9kZTtcblx0dGhpcy5saXN0ID0gbGlzdDtcblx0dGhpcy5uYW1lID0gdGhpcy5ub2RlLmNoaWxkcmVuWzBdO1xuXHR0aGlzLmRuc1N0YXRlID0gdGhpcy5ub2RlLmNoaWxkcmVuWzJdLmNoaWxkcmVuWzFdLmNoaWxkcmVuWzBdO1xuXHR0aGlzLnBpbmdTdGF0ZSA9IHRoaXMubm9kZS5jaGlsZHJlblszXS5jaGlsZHJlblsxXS5jaGlsZHJlblswXTtcblx0dGhpcy5odHRwU3RhdGUgPSB0aGlzLm5vZGUuY2hpbGRyZW5bNF0uY2hpbGRyZW5bMV0uY2hpbGRyZW5bMF07XG5cdHRoaXMuZG5zTGFzdENoZWNrID0gdGhpcy5ub2RlLmNoaWxkcmVuWzJdLmNoaWxkcmVuWzFdLmNoaWxkcmVuWzJdO1xuXHR0aGlzLnBpbmdMYXN0Q2hlY2sgPSB0aGlzLm5vZGUuY2hpbGRyZW5bM10uY2hpbGRyZW5bMV0uY2hpbGRyZW5bMl07XG5cdHRoaXMuaHR0cExhc3RDaGVjayA9IHRoaXMubm9kZS5jaGlsZHJlbls0XS5jaGlsZHJlblsxXS5jaGlsZHJlblsyXTtcblx0dGhpcy5nb1RvRG9tYWluID0gdGhpcy5ub2RlLmNoaWxkcmVuWzVdLmNoaWxkcmVuWzBdO1xuXHR0aGlzLnJlc2V0Rm9jdXMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuZm9jdXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXHRcdHRoaXMuZm9jdXMuZm9jdXNlZCA9IGZhbHNlO1xuXHRcdHRoaXMuZm9jdXMgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5ub2RlLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuXHR9XG5cdHRoaXMuc2V0Rm9jdXMgPSBmdW5jdGlvbiAobmV3Rm9jdXMpIHtcblx0XHRjb25zb2xlLmxvZyhcIm5ldyBmb2N1cy4uLlwiLCBuZXdGb2N1cyk7XG5cdFx0aWYgKHRoaXMuZm9jdXMgIT09IHVuZGVmaW5lZCAmJiBuZXdGb2N1cyA9PT0gdGhpcy5mb2N1cy5kb21haW4pIHtcblx0XHRcdHRoaXMuZm9jdXMuZm9jdXNlZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy5mb2N1cyA9IHVuZGVmaW5lZDtcblx0XHRcdHRoaXMubm9kZS5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMubGlzdC5lbnRyaWVzW25ld0ZvY3VzXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZiAodGhpcy5mb2N1cyAhPT0gdW5kZWZpbmVkKSB0aGlzLmZvY3VzLmZvY3VzZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMuZm9jdXMgPSB0aGlzLmxpc3QuZW50cmllc1tuZXdGb2N1c107XG5cdFx0XHR0aGlzLmZvY3VzLmZvY3VzZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5uYW1lLmlubmVySFRNTCA9IHRoaXMuZm9jdXMuZG9tYWluO1xuXHRcdFx0dGhpcy5nb1RvRG9tYWluLmhyZWYgPSBcImh0dHA6Ly9cIiArIHRoaXMuZm9jdXMuZG9tYWluO1xuXHRcdFx0dGhpcy5mb2N1cy5zZXREbnMoKTtcblx0XHRcdHRoaXMuZm9jdXMuc2V0UGluZygpO1xuXHRcdFx0dGhpcy5mb2N1cy5zZXRIdHRwKCk7XG5cdFx0XHR0aGlzLm5vZGUuY2xhc3NMaXN0LnJlbW92ZShcImhpZGVcIik7XG5cdFx0fVxuXHR9XG5cdHRoaXMuc2V0RG5zID0gZnVuY3Rpb24gKG5ld1N0YXRlLCBuZXdEYXRlKSB7XG5cdFx0dGhpcy5kbnNMYXN0Q2hlY2suaW5uZXJIVE1MID0gXCJETlMgTGFzdCBDaGVja2VkOiBcIiArIG5ld0RhdGU7XG5cdFx0dGhpcy5kbnNTdGF0ZS5pbm5lckhUTUwgPSBcIlN0YXRlOiBcIiArIFwiPHNwYW4gc3R5bGU9XFxcImRpc3BsYXk6IGlubGluZS1ibG9jazsgd2lkdGg6IDEzY2g7IGJhY2tncm91bmQtY29sb3I6IFwiICsgdGhpcy5zdGF0ZUxpc3RbbmV3U3RhdGVdWzFdICsgXCI7XFxcIj5cIiArIHRoaXMuc3RhdGVMaXN0W25ld1N0YXRlXVswXSArIFwiPC9zcGFuPlwiO1xuXHR9XG5cdHRoaXMuc2V0UGluZyA9IGZ1bmN0aW9uIChuZXdTdGF0ZSwgbmV3RGF0ZSkge1xuXHRcdHRoaXMucGluZ0xhc3RDaGVjay5pbm5lckhUTUwgPSBcIlBpbmcgTGFzdCBDaGVja2VkOiBcIiArIG5ld0RhdGU7XG5cdFx0dGhpcy5waW5nU3RhdGUuaW5uZXJIVE1MID0gXCJTdGF0ZTogXCIgKyBcIjxzcGFuIHN0eWxlPVxcXCJkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IHdpZHRoOiAxM2NoOyBiYWNrZ3JvdW5kLWNvbG9yOiBcIiArIHRoaXMuc3RhdGVMaXN0W25ld1N0YXRlXVsxXSArIFwiO1xcXCI+XCIgKyB0aGlzLnN0YXRlTGlzdFtuZXdTdGF0ZV1bMF0gKyBcIjwvc3Bhbj5cIjtcblx0fVxuXHR0aGlzLnNldEh0dHAgPSBmdW5jdGlvbiAobmV3U3RhdGUsIG5ld0RhdGUpIHtcblx0XHR0aGlzLmh0dHBMYXN0Q2hlY2suaW5uZXJIVE1MID0gXCJIVFRQIExhc3QgQ2hlY2tlZDogXCIgKyBuZXdEYXRlO1xuXHRcdHRoaXMuaHR0cFN0YXRlLmlubmVySFRNTCA9IFwiU3RhdGU6IFwiICsgXCI8c3BhbiBzdHlsZT1cXFwiZGlzcGxheTogaW5saW5lLWJsb2NrOyB3aWR0aDogMTNjaDsgYmFja2dyb3VuZC1jb2xvcjogXCIgKyB0aGlzLnN0YXRlTGlzdFtuZXdTdGF0ZV1bMV0gKyBcIjtcXFwiPlwiICsgdGhpcy5zdGF0ZUxpc3RbbmV3U3RhdGVdWzBdICsgXCI8L3NwYW4+XCI7XG5cdH1cblx0dGhpcy51cGRhdGVYID0gZnVuY3Rpb24gKHgpIHtcblx0XHR0aGlzLmZvY3VzW3hdLmdldFJlbW90ZSgpO1xuXHR9XG5cdHRoaXMubm9kZS5jaGlsZHJlblsyXS5jaGlsZHJlblswXS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy51cGRhdGVYLmJpbmQodGhpcywgXCJkbnNcIikpO1xuXHR0aGlzLm5vZGUuY2hpbGRyZW5bM10uY2hpbGRyZW5bMF0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMudXBkYXRlWC5iaW5kKHRoaXMsIFwicGluZ1wiKSk7XG5cdHRoaXMubm9kZS5jaGlsZHJlbls0XS5jaGlsZHJlblswXS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy51cGRhdGVYLmJpbmQodGhpcywgXCJodHRwXCIpKTtcbn1cbmNvbnNvbGUubG9nKFwiU2NyaXB0IGxvYWRlZC5cIik7XG52YXIgbGlzdCA9IG5ldyBEb21haW5MaXN0KFwiZG9tYWluTGlzdFwiLCBcInNlYXJjaERvbWFpbklucHV0XCIsIFwiYWRkRG9tYWluSW5wdXRcIiwgXCJmZWVkYmFja1wiLCBcInVwZGF0ZURvbWFpbkxpc3RcIiwgXCJkb21haW5Db3VudFwiLCBcImRvbWFpbkluZm9cIiwgXCJsb2dcIiwgZnVuY3Rpb24gKCkge2NvbnNvbGUubG9nKFwiSW5pdCBvZiBEb21haW5MaXN0IGNvbXBsZXRlLlwiKX0pO1xuLyp2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5yZXEub3BlbihcIkdFVFwiLCBcIi9kb21haW5zLnR4dFwiKTtcbnJlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG5cdGlmIChyZXEuc3RhdHVzID09PSAyMDAgJiYgcmVxLnJlYWR5U3RhdGUgPT09IDQpIHtcblx0XHRjb25zb2xlLmxvZyhzdGFydCA9IERhdGUubm93KCkpO1xuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG9tYWluTGlzdFwiKS5pbm5lckhUTUwgPSByZXEucmVzcG9uc2U7XG5cdFx0Y29uc29sZS5sb2coRGF0ZS5ub3coKSwgRGF0ZS5ub3coKSAtIHN0YXJ0KTtcblx0fVxufVxucmVxLnNlbmQoKTtcbiovXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NjcmlwdC5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJpbmRleC5odG1sXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9pbmRleC5odG1sXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcInN0eWxlLmNzc1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3R5bGUuY3NzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=