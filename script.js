var RemoteProperty = function (initValue, checker, parser, change, getRemote, initCallback) {
	this.endpoint = endpoint;
	this.checker = checker ? checker : ()=>{};
	this.parser = parser ? parser : ()=>{};
	this.change = change ? change : ()=>{};
	this.initCallback = initCallback ? initCallback : ()=>{};
	this.gettingRemote = false;
	this.value = initValue;
	this.callbacks = [];
	if (getRemote === true) this.getRemote(initCallback);
}
RemoteProperty.prototype.getRemote = function (callback) {
	for (var ii = 0; ii < arguments.length; ii++) {
		this.callbacks.push(arguments[ii]);
	}
	if (!this.gettingRemote) {
		this.gettingRemote = true;
		this.checker(this.setValue.bind(this));
	}
}
RemoteProperty.prototype.setValue = function () {
	var oldVar = this.value;
	this.value = this.handler.apply(this, arguments);
	if (this.value !== oldVar) this.change(this.value);
	while (this.callbacks.length > 0) {
		(this.callbacks.pop())(this.value);
	}
}

var DomainListItem = function (domainJson) {
	//console.log("Making DomainListItem with ", domainJson);
	this.domain = domainJson.domainName;
	//this.dns = new RemoteProperty({dns: domainJson.dns, lastCheck: domainJson.dnsLastCheck});
	this.dns = {
		state: domainJson.dns,
		lastCheck: domainJson.dnsLastCheck
	}
	this.ping = {
		state: domainJson.ping,
		lastCheck: domainJson.pingLastCheck
	}
	this.http = {
		state: domainJson.http,
		lastCheck: domainJson.httpLastCheck
	}
	/*this.pingLastCheck = domainJson.pingLastCheck;
	this.dnsLastCheck = domainJson.dnsLastCheck;
	this.httpLastCheck = domainJson.httpLastCheck;
	this.ping = domainJson.ping;
	this.dns = domainJson.dns;
	this.http = domainJson.http;*/
	var match = this.domain.match(/([^\s]+\.|)ed\.ac\.uk$/);
	//console.log(match);
	this.hidden = false;
	if (match === null) {
		this.hide();
		this.show = this.hide;
	} else {
		this.nodes = {};
		this.subdomain = match[1];
		this.nodes.root = document.createElement("div");
		this.nodes.dns = document.createElement("div");
		this.nodes.dns.className = "domainDns";
		this.nodes.ping = document.createElement("div");
		this.nodes.ping.className = "domainPing";
		this.nodes.http = document.createElement("div");
		this.nodes.http.className = "domainHttp";
		this.nodes.pingLastCheck = document.createElement("div");
		this.nodes.pingLastCheck.className = "domainPingLastCheck";
		var pingDate = new Date(this.ping.lastCheck);
		this.nodes.pingLastCheck.appendChild(document.createTextNode((pingDate.getUTCFullYear()-2000).toString().padStart(2, "0") + "/" + pingDate.getUTCMonth().toString().padStart(2, "0") + "/" + pingDate.getUTCDate().toString().padStart(2, "0") + " " + pingDate.getUTCHours().toString().padStart(2, "0") + ":" + pingDate.getUTCMinutes().toString().padStart(2, "0")));
		this.nodes.tableSpacer = document.createElement("div");
		this.nodes.tableSpacer.className = "domainTableSpacer";
		this.nodes.domainName = document.createElement("div");
		this.nodes.domainName.className = "domainName";
		this.nodes.prefix = document.createElement("a");
		this.nodes.prefix.className = "domainPrefix"
		this.nodes.prefix.href = "http://" + this.domain;
		this.nodes.prefix.appendChild(document.createTextNode(this.subdomain));
		this.nodes.suffix = document.createElement("a");
		this.nodes.suffix.className = "domainSuffix"
		this.nodes.suffix.href = "http://" + this.domain;
		this.nodes.suffix.appendChild(document.createTextNode("ed.ac.uk"));
		this.nodes.domainName.appendChild(this.nodes.prefix);
		this.nodes.domainName.appendChild(this.nodes.suffix);
		this.setDns();
		this.setPing();
		this.setHttp();
		this.nodes.root.className = "domainListItem";
		this.nodes.root.appendChild(this.nodes.dns);
		this.nodes.root.appendChild(this.nodes.ping);
		this.nodes.root.appendChild(this.nodes.http);
		this.nodes.root.appendChild(this.nodes.pingLastCheck);
		this.nodes.root.appendChild(this.nodes.tableSpacer);
		this.nodes.root.appendChild(this.nodes.domainName);
	}
	this.updateKey = {
		"domainName": ()=>{},
		"dns": this.setDns.bind(this),
		"ping": this.setPing.bind(this),
		"http": this.setHttp.bind(this),
		"dnsLastCheck": ()=>{},
		"pingLastCheck": ()=>{},
		"httpLastCheck": ()=>{}
	}
}
DomainListItem.prototype.update = function (newJson) {
	for (var index in newJson) {
		if (newJson[index] !== this[index]) {
			this[index] = newJson[index];
			this.updateKey[index](this[index]);
		}
	}
}
DomainListItem.prototype.colorCode = {
	"-1": "#CDDC39",
	"0": "#4CAF50",
	"1": "#FF5722"
}
DomainListItem.prototype.setDns = function (newDns) {
	if (newDns !== undefined) {
		this.dns.state = newDns.state;
		this.dns.lastCheck = newDns.lastCheck;
	}
	/*if (this.dns === 0) this.dnsNode.style.backgroundColor = "#4CAf50";
	else this.dnsNode.style.backgroundColor = "#FF5722";*/
	this.nodes.dns.style.backgroundColor = this.colorCode[this.dns.state];
}
DomainListItem.prototype.setPing = function (newPing) {
	if (newPing !== undefined) {
		this.ping.state = newPing.state;
		this.ping.lastCheck = newPing.lastCheck;
	}
	/*if (this.ping === 0) this.pingNode.style.backgroundColor = "#4CAf50";
	else this.pingNode.style.backgroundColor = "#FF5722";*/
	this.nodes.ping.style.backgroundColor = this.colorCode[this.ping.state];
}
DomainListItem.prototype.setHttp = function (newHttp) {
	if (newHttp !== undefined) {
		this.http.state = newHttp.state;
		this.http.lastCheck = newHttp.lastCheck;
	}
	/*if (this.http === 0) this.httpNode.style.backgroundColor = "#4CAf50";
	else this.httpNode.style.backgroundColor = "#FF5722";*/
	this.nodes.http.style.backgroundColor = this.colorCode[this.http.state];
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
var DomainList = function (id, searchId, submitId, feedbackId, updateId, domainCountId) {
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
	this.searchNode.addEventListener("input", this.searchDomainItems.bind(this));
	this.entries = {};
	this.orderedDomains = [];
	this.inputNode = document.getElementById(submitId);
	this.inputNode.addEventListener("keydown", this.handleInputKeys.bind(this));
	this.domainCount = document.getElementById(domainCountId);
	this.state = 0;
	this.feedback = {
		node: document.getElementById(feedbackId),
		stateTexts: {
			"-2": "Querying server for existing domains...",
			"-1": "Querying server about submitted domain...",
			"0":  "Domain legitimate. Added.",
			"1":  "Domain is already in the list.",
			"2":  "Domain has no DNS entry.",
			"3":  "Domain is not a subdomain of ed.ac.uk.",
			"4":  "Got the domain list from server.",
			"5":  "Could not get the domain list from server."
		},
		stateColours: {
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
	//console.log(e, this.inputNode.value);
	if (e.keyCode === 13) {
		//console.log("domains being sent");
		e.preventDefault();
		this.askDomain(this.inputNode.value);
	}
}
DomainList.prototype.findOrderedIndex = function (domain, subsetLeft, subsetRight) {
	subsetLeft = subsetLeft !== undefined ? subsetLeft : 0;
	subsetRight = subsetRight !== undefined ? subsetRight : this.orderedDomains.length;
	while (subsetLeft !== subsetRight) {
		var checkDomain = this.orderedDomains[subsetLeft + Math.floor((subsetRight - subsetLeft) / 2)];
		//console.log("checkDomain: ", checkDomain, subsetLeft, subsetRight, checkDomain > domain);
		if (checkDomain > domain) subsetRight = subsetLeft + Math.floor((subsetRight - subsetLeft) / 2);
		else subsetLeft = subsetRight - Math.floor((subsetRight - subsetLeft) / 2);
	}
	return subsetLeft;
}
DomainList.prototype.addDomainItem = function (resJson) {
	if (this.entries[resJson.domainName] === undefined) {
		//return this.findOrderedIndex(resJson);
		var orderedIndex = this.findOrderedIndex(resJson.domainName);
		this.orderedDomains.splice(orderedIndex, 0, resJson.domainName);
		this.entries[resJson.domainName] = new DomainListItem(resJson);
		//console.log(orderedIndex, resJson, this.entries, this.orderedDomains);
		if (this.node.children.length === 0) {
			this.node.appendChild(this.entries[resJson.domainName].nodes.root);
		} else if (orderedIndex === this.node.children.length) {
			this.node.appendChild(this.entries[resJson.domainName].nodes.root);
		} else {
			this.node.insertBefore(this.entries[resJson.domainName].nodes.root, this.node.children[orderedIndex]);
		}
		this.searchDomainItems();
	} else {
		this.entries[resJson.domainName].update(resJson);
	}
}
DomainList.prototype.askDomain = function (domain) {
	if (this.state >= 0) {
		this.feedback.setState(-1);
		var req = new XMLHttpRequest();
		req.open("GET", "/add?domain="+domain);
		req.onreadystatechange = (function (req) {
			if (req.readyState === 4) {
				this.serverResponseControl(req.response);
			}
		}).bind(this, req);
		req.send();
	} else {
		console.log("State already running, wait until later.");
	}
}
DomainList.prototype.getRemoteDomains = function () {
	if (this.state >= 0) {
		this.setState(-2);
		var req = new XMLHttpRequest();
		req.open("GET", "/data");
		req.onreadystatechange = (function (req) {
			if (req.readyState === 4) {
				//console.log(req.response);
				this.setRemoteDomains(req.response);
			}
		}).bind(this, req);
		req.send();
	} else {
		console.log("State already running, wait until later.");
	}

}
DomainList.prototype.setRemoteDomains = function (res) {
	try {
		var resJson = JSON.parse(res);
		for (var ii = 0; ii < resJson.length; ii++) {
			this.addDomainItem(resJson[ii]);
		}
		this.setState(4);
		this.searchDomainItems();
	} catch (e) {
		this.setState(5);
		console.log(e, "Illegitimate output from server on /data endpoint.");
	}
}
DomainList.prototype.serverResponseControl = function (res) {
	try {
		var resJson = JSON.parse(res);
		this.setState(resJson.state);
		if (resJson.state === 0) {
			//console.log("Domain was accepted.");
			this.addDomainItem(resJson.data);
		} else {
			//console.log("Domain was not accepted.");
		}
	} catch (e) {
		//console.log(e, "Illegitimate output from server on /add endpoint.");
	}
}
DomainList.prototype.searchDomainItems = function (e) {
	//console.log(e, this.search, new RegExp(this.search));
	if (this.search === "") {
		var entriesExist = 0;
		var entriesShown = 0;
		for (var domain in this.entries) {
			this.entries[domain].show();
			entriesExist++;
			entriesShown++;
		}
		this.domainCount.innerHTML = entriesShown.toString() + "/" + entriesExist.toString();
	} else {
		try {
			var regex = new RegExp(this.search);
		} catch (e) {
			return;
		}
		var entriesExist = 0;
		var entriesShown = 0;
		for (var domain in this.entries) {
			//console.log(domain);
			if (this.entries[domain].domain.match(regex) !== null) {
				this.entries[domain].show();
				entriesShown++;
			} else this.entries[domain].hide();
			entriesExist++;
		}
		this.domainCount.innerHTML = entriesShown.toString() + "/" + entriesExist.toString();
	}
}
console.log("Script loaded.");
var list = new DomainList("domainList", "searchDomainInput", "addDomainInput", "serverFeedback", "updateDomainList", "domainCount");

