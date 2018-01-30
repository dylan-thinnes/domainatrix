'use strict';
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

var MoreInfo = function (infoNode, buttonNode, showing, showingText, hiddenText) {
	this.info = infoNode;
	this.button = buttonNode;
	if (showingText === undefined && hiddenText === undefined) this.useText = false;
	else this.useText = true;
	this.hiddenText = hiddenText ? hiddenText : this.button.innerHTML;
	this.showingText = showingText ? showingText : this.button.innerHTML;
	this.showing = showing ? showing : false;
	this.showing = !this.showing;
	this.toggle();
	this.button.addEventListener("click", this.toggle.bind(this));
}
MoreInfo.prototype.toggle = function () {
	if (this.showing) this.hide();
	else this.show();
	this.showing = !this.showing;
}
MoreInfo.prototype.hide = function () {
	this.info.style.display = "none";
	if (this.useText === true) this.button.innerHTML = this.hiddenText;
}
MoreInfo.prototype.show = function () {
	this.info.style.display = "initial";
	if (this.useText === true) this.button.innerHTML = this.showingText;
}
var blurb = new MoreInfo(document.getElementById("guide"), document.getElementById("toggleGuide"), false, "What is this? / More Info -", "What is this? / More Info +");

var DomainListItem = function (domainJson, infoOutput) {
	this.domain = domainJson.name;
	this.infoOutput = infoOutput;
	this.initJson = domainJson;
	this.tempId = (Math.random() * Math.pow(2,32)).toString(16);
	this.dns = new RemoteProperty(domainJson.dns, this.getX.bind(this, "/v1/domains/" + this.domain + "/dns"), JSON.parse.bind(JSON), this.update.bind(this), 30*60*1000, this.setDns.bind(this, {state: -1}), false);
	this.ping = new RemoteProperty(domainJson.ping, this.getX.bind(this, "/v1/domains/" + this.domain + "/ping"), JSON.parse.bind(JSON), this.update.bind(this), 30*60*1000, this.setPing.bind(this, {state: -1}), false);
	this.http = new RemoteProperty(domainJson.http, this.getX.bind(this, "/v1/domains/" + this.domain + "/http"), JSON.parse.bind(JSON), this.update.bind(this), 30*60*1000, this.setHttp.bind(this, {state: -1}), false);
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
var DomainList = function (id, searchId, submitId, feedbackId, updateId, domainCountId, infoId, callback) {
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
			"0":  "Domain legitimate. Added.",
			"1":  "Domain is already in the list.",
			"2":  "Domain has no DNS entry.",
			"3":  "Domain is not a subdomain of ed.ac.uk.",
			"4":  "List of domains found and rendered.",
			"5":  "Could not get the domain list from server."
		},
		stateColours: {
			"-3": "#CDDC39",
			"-2": "#CDDC39",
			"-1": "#CDDC39",
			"0":  "#4CAf50",
			"1":  "#03A9F4",
			"2":  "#FF5722",
			"3":  "#FF5722",
			"4":  "#4CAf50",
			"5":  "#CDDC39"
		},
		setState: function (state) {
			this.node.innerHTML = this.stateTexts[state];
			this.node.style.backgroundColor = this.stateColours[state];
		}
	}
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
DomainList.prototype.submitDomains = function (names) {
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
            if (singleRes.state === 0) {
                this.addDomainItem(singleRes.data);
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
        console.log(newState);
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
var list = new DomainList("domainList", "searchDomainInput", "addDomainInput", "serverFeedback", "updateDomainList", "domainCount", "domainInfo", function () {console.log("Init of DomainList complete.")});
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
