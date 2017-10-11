var dns = require("dns");
var http = require("http");
var url = require("url");
var fs = require("fs");
var ping = require("ping");
var writeFileToRes = function (res, err, file) {
	if (err) {
		res.writeHead(404);
		res.end("index.html not found.");
	} else {
		res.end(file);
	}
}

var State = function (domainName, checker, handler, change) {
	/* State 0 is resolved positive position,
	 * State 1 is resolved negative position,
	 * State -1 is processing or undetermined state
	 */
	//console.log("State initialized with args ", arguments);
	this.domainName = domainName;
	this.checker = checker;
	this.handler = handler;
	this.lastCheck = 0;
	this.state = 1;
	this.callbacks = [];
	this.change = change;
}
State.prototype.check = function (/* callbacks passed in here */) {
	console.log("check called with callbacks", arguments);
	for (var ii = 0; ii < arguments.length; ii++) {
		this.callbacks.push(arguments[ii]);
	}
	if (this.lastCheck >= Date.now() - 30*60*1000) this.runCallbacks();
	else if (this.state !== -1) {
		this.state = -1;
		this.checker(this.setState.bind(this));
	}
}
State.prototype.setState = function () {
	//console.log("setState called");
	this.lastCheck = Date.now();
	var oldState = this.state;
	this.state = this.handler.apply(this, arguments);
	//console.log("state set to...", this.state);
	//console.log(this.callbacks);
	if (oldState !== this.state) this.change(this.state);
	this.runCallbacks();
}
State.prototype.runCallbacks = function () {
	while (this.callbacks.length > 0) {
		(this.callbacks.pop())(this.state);
	}
}
module.exports.State = State;

var Domain = function (domainName, isNew, initCallback) {
	this.domainName = domainName;
	this.isNew = isNew;
	this.initDone = false;
	this.dns = new State(this.domainName, function (callback) {
		dns.lookup(this.domainName, callback.bind(this));
	}, function (err, res) {
		var dns = err ? 1 : 0;
		console.log("dns returned " + dns);
		return dns;
	}, this.writeState.bind(this));
	this.ping = new State(this.domainName, function (callback) {
		console.log("ping called for ", this.domainName);
		ping.sys.probe(this.domainName, callback.bind(this));
	}, function (pingExists) {
		var ping = pingExists ? 0 : 1;
		console.log("ping returned " + ping);
		return ping;
	}, this.writeState.bind(this));
	this.http = new State(this.domainName, function (callback) {
		console.log("http called for ", this.domainName);
		var req = http.request({
			host: this.domainName,
			path: "/",
			port: 80,
			method: "GET"
		}, callback.bind(this, true, req, false));
		req.setTimeout(10000, req.destroy.bind(req));
		req.on("error", callback.bind(this, false, req, false));
		req.end();
	}, function (http, req, cancel) {
		//if (cancel === true) req.abort();
		http = http ? 0 : 1;
		console.log("http returned " + http);
		return http;
	}, this.writeState.bind(this));
	if (this.isNew === true) {
		delete this.isNew;
		this.dns.check(initCallback, this.finishInit.bind(this, "dns"));
	} else this.readState(initCallback);
}
Domain.prototype.finishInit = function (e) {
	if (this.initDone === false) this.initDone = true;
}
Domain.prototype.readState = function (callback) {
	this.callback = callback ? callback : ()=>{};
	fs.readFile("domains/" + this.domainName + ".txt", this.parseState.bind(this, callback));
}
Domain.prototype.parseState = function (callback, err, res) {
	if (err) return;
	else {
		try {
			var resJson = JSON.parse(res);
			if (resJson.dns === undefined) this.dns.check(callback, this.finishInit.bind(this, "dns"));
			else {
				this.ping.state = resJson.ping !== undefined && resJson.ping !== -1 ? resJson.ping : this.ping.state;
				this.dns.state = resJson.dns !== undefined && resJson.dns !== -1 ? resJson.dns : this.dns.state;
				this.http.state = resJson.http !== undefined && resJson.http !== -1 ? resJson.http : this.http.state;
				this.ping.lastCheck = resJson.pingLastCheck !== undefined ? resJson.pingLastCheck : this.ping.lastCheck;
				this.dns.lastCheck = resJson.dnsLastCheck !== undefined ? resJson.dnsLastCheck : this.dns.lastCheck;
				this.http.lastCheck = resJson.httpLastCheck !== undefined ? resJson.httpLastCheck : this.http.lastCheck;
				this.finishInit("dns");
				callback(this.dns.state);
			}
		} catch (e) {
			return;
		}
	}
}
Domain.prototype.toJson = function () {
	return {
		domainName: this.domainName,
		ping: this.ping.state,
		dns: this.dns.state,
		http: this.http.state,
		pingLastCheck: this.ping.lastCheck,
		dnsLastCheck: this.dns.lastCheck,
		httpLastCheck: this.http.lastCheck
	}
}
Domain.prototype.writeState = function () {
	fs.writeFile("domains/" + this.domainName + ".txt", JSON.stringify(this.toJson()), () => {});
}
module.exports.Domain = Domain;

var DomainData = function (path, initCallback) {
	this.domains = {}; 
	this.initCallback = initCallback;
	var domainEntries = fs.readdirSync("./domains");
	this.initCandidates = domainEntries.length + 1;
	for (var ii = 0; ii < domainEntries.length; ii++) {
		let name = domainEntries[ii].replace(/^(.+)\.txt$/g, "$1");
		if (name === null) this.callbackControl("initCandidate");
		else this.addDomainCandidate(name, false, this.callbackControl.bind(this, "initCandidate"));
	}
	this.callbackControl("initCandidate");
}
DomainData.prototype.callbackControl = function (event) {
	console.log("callbackControl called with " + event, this.initCandidates);
	if (event === "initCandidate") this.initCandidates--;
	if (this.initCandidates === 0) this.initCallback();
}
DomainData.prototype.parseDomain = function (domain) {
	return domain.match(/^([^\s]+\.|)ed\.ac\.uk$/g);
}

DomainData.prototype.getXFromDomain = function (x, domain, callback) {
	if (this.domains[domain] !== undefined) this.domains[domain][x].check(this.writeXFromDomain.bind(this, x, domain, callback));
}
DomainData.prototype.writeXFromDomain = function (x, domain, callback, state) {
	var res = {
		"state": state,
		"lastCheck": this.domains[domain][x].lastCheck
	}
	callback(JSON.stringify(res));
}

DomainData.prototype.addDomainCandidate = function (domain, isNew, callback) {
	//console.log(this.domains, domain);
	var parsedDomain = this.parseDomain(domain);
	if (parsedDomain !== null) {
		if (this.domains[domain] !== undefined) callback(JSON.stringify({"state": 1}));
		else {
			var subDomain = parsedDomain[1];
			this.domains[domain] = new Domain(domain, isNew, this.parseCandidate.bind(this, domain, callback));
		}
	} else callback(JSON.stringify({"state": 3}));
}
DomainData.prototype.parseCandidate = function (domain, callback, dns) {
	//console.log("parsing candidate", domain, dns);
	if (dns !== 0) {
		delete this.domains[domain];
		callback(JSON.stringify({"state": 2}));
	} else {
		/*this.domains[domain].checkPing();
		this.domains[domain].checkHttp();*/
		//console.log("Returning data on ", domain);
		callback(JSON.stringify({"state": 0, "data": this.domains[domain].toJson()}));
	}
}
DomainData.prototype.getJson = function () {
	//return JSON.stringify(this.domains);
	var res = [];
	//console.log("getJson started...", this.domains);
	for (var index in this.domains) {
		//console.log("index is ", index);
		//res[this.domains[index].domainName] = this.domains[index].toJson();
		if (this.domains[index].initDone === false) continue;
		res.push(this.domains[index].toJson());
	}
	//console.log(res, JSON.stringify(res));
	return JSON.stringify(res);
}
module.exports.DomainData = DomainData;

var domData = new DomainData("domains.txt", function () {
	//console.log("initCallback started");
	//console.log(domData.domains);
	//console.log(domData.getJson());
	var server = new http.createServer(function (req, res) {
		var parsedUrl = url.parse(req.url, true);
		if (parsedUrl.pathname === "/" || parsedUrl.pathname === "/index.html") {
			res.setHeader("Content-Type", "text/html");
			fs.readFile("index.html", writeFileToRes.bind(this, res));
		} else if (parsedUrl.pathname === "/script.js") {
			res.setHeader("Content-Type", "application/script");
			fs.readFile("script.js", writeFileToRes.bind(this, res));
		} else if (parsedUrl.pathname === "/style.css") {
			res.setHeader("Content-Type", "text/css");
			fs.readFile("style.css", writeFileToRes.bind(this, res));
		} else if (parsedUrl.pathname === "/add" || parsedUrl.pathname === "/add/index.html") {
			domData.addDomainCandidate(parsedUrl.query.domain, true, res.end.bind(res));
		} else if (parsedUrl.pathname === "/dns" || parsedUrl.pathname === "/dns/index.html") {
			//domData.dnsDomain(parsedUrl.query.domain, res.end.bind(res));
			//domData.addDomainCandidate(parsedUrl.query.domain, true, res.end.bind(res));
			domData.getXFromDomain("dns", parsedUrl.query.domain, res.end.bind(res));
		} else if (parsedUrl.pathname === "/ping" || parsedUrl.pathname === "/ping/index.html") {
			//domData.pingDomain(parsedUrl.query.domain, res.end.bind(res));
			//domData.addDomainCandidate(parsedUrl.query.domain, true, res.end.bind(res));
			domData.getXFromDomain("ping", parsedUrl.query.domain, res.end.bind(res));
		} else if (parsedUrl.pathname === "/http" || parsedUrl.pathname === "/http/index.html") {
			//domData.httpDomain(parsedUrl.query.domain, res.end.bind(res));
			//domData.addDomainCandidate(parsedUrl.query.domain, true, res.end.bind(res));
			domData.getXFromDomain("http", parsedUrl.query.domain, res.end.bind(res));
		} else if (parsedUrl.pathname === "/data" || parsedUrl.pathname === "/data/index.html") {
			//res.end(domData.getDomains());
			res.end(domData.getJson());
		} else if (parsedUrl.pathname === "/favicon.ico") {
			fs.readFile("favicon.ico", writeFileToRes.bind(this, res));
		} else {
			res.writeHead(404);
			res.end();
		}
	});
	server.listen(80);
	//console.log(this.getDomains());
});
