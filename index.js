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

var Domain = function (domainName, isNew, initCallback) {
	this.state = 0;
	this.domainName = domainName;
	this.isNew = isNew;
	this.initDone = false;
	this.dnsLastCheck = 0;
	this.pingLastCheck = 0;
	this.httpLastCheck = 0;
	if (this.isNew) this.checkDns(initCallback);
	else this.readState(initCallback);
}
Domain.prototype.stateControl = function (e) {
	console.log("done invoked with event: ", e);
	if (e === "dns") {
		this.dnsState = true;
		this.writeState();
	} else if (e === "ping") {
		this.pingState = true;
	} else if (e === "http") {
		this.httpState = true;
	}

	if (this.dnsState === true && this.initDone === false/* && this.pingState === true*//* && this.httpState === true*/) {
		this.initDone = true;
		//if (this.isNew === true && this.dns === true) this.writeState();
		//console.log("Running callback ", this.callback, this.dns);
		//this.callback(this.dns/*, this.ping, this.http*/);
	}
}
Domain.prototype.check = function (callback) {
	this.callback = callback ? callback : ()=>{};
	this.dnsState = false;
	//this.pingState = false;
	//this.httpState = false;
	this.checkDns();
	//this.checkPing();
	//this.checkHttp();
}
Domain.prototype.checkDns = function (callback) {
	this.dnsLock = true;
	dns.lookup(this.domainName, this.setDns.bind(this, callback));
}
Domain.prototype.checkPing = function (callback) {
	this.pingLock = true;
	ping.sys.probe(this.domainName, this.setPing.bind(this, callback));
}
Domain.prototype.checkHttp = function (callback) {
	this.httpLock = true;
	var req = http.request({
		host: this.domainName,
		path: "/",
		port: 80,
		method: "GET"
	}, this.setHttp.bind(this, callback, true));
	req.setTimeout(10000, this.abortHttp.bind(this, callback, req));
	req.on("error", this.setHttp.bind(this, callback, false));
	req.end();
}
Domain.prototype.abortHttp = function (callback, req) {
	req.abort();
	this.setHttp(callback, false);
}
Domain.prototype.setDns = function (callback, err, res) {
	this.dns = err ? false : true;
	this.dnsLastCheck = Date.now();
	console.log(callback, res);
	if (callback) callback(this.dns, this.dnsLastCheck);
	this.stateControl("dns");
	this.writeState();
}
Domain.prototype.setPing = function (callback, pingExists) {
	this.ping = pingExists ? true : false;
	this.pingLastCheck = Date.now();
	if (callback) callback(this.ping, this.pingLastCheck);
	//this.stateControl("ping");
	this.writeState();
}
Domain.prototype.setHttp = function (callback, httpExists, res) {
	if (httpExists === true && res.statusCode !== 404) this.http = true;
	else this.http = false;
	this.httpLastCheck = Date.now();
	if (callback) callback(this.http, this.httpLastCheck);
	//this.stateControl("http");
	this.writeState();
}
Domain.prototype.readState = function (callback) {
	this.callback = callback ? callback : ()=>{};
	this.dnsState = false;
	this.pingState = false;
	this.httpState = false;
	fs.readFile("domains/" + this.domainName + ".txt", this.parseState.bind(this, callback));
}
Domain.prototype.parseState = function (callback, err, res) {
	if (err) return;
	else {
		try {
			var resJson = JSON.parse(res);
			this.ping = resJson.ping;
			this.dns = resJson.dns;
			this.http = resJson.http;
			this.pingLastCheck = resJson.pingLastCheck;
			this.dnsLastCheck = resJson.dnsLastCheck;
			this.httpLastCheck = resJson.httpLastCheck;
			this.stateControl("dns");
			callback(this.dns);
			//this.stateControl("ping");
			//this.stateControl("http");
		} catch (e) {
			return;
		}
	}
}
Domain.prototype.toJson = function () {
	return {
		domainName: this.domainName,
		ping: this.ping,
		dns: this.dns,
		http: this.http,
		pingLastCheck: this.pingLastCheck,
		dnsLastCheck: this.dnsLastCheck,
		httpLastCheck: this.httpLastCheck
	}
}
Domain.prototype.writeState = function () {
	//console.log("writing state...");
	fs.writeFile("domains/" + this.domainName + ".txt", JSON.stringify(this.toJson()), () => {});
}
module.exports.Domain = Domain;

var DomainData = function (path, initCallback) {
	this.domains = {}; 
	this.initCallback = initCallback;
	/*this.newWrite = false;
	this.fileSet = false;
	if (typeof this.path === "string") {
		fs.readFile(this.path, "utf8", (function (err, res) {
			if (err) {
				this.newWrite = true;
				this.initCandidates = 0;
			} else {
				var candidates = res.split("\n");
				this.initCandidates = candidates.length + 1;
				for (var ii = 0; ii < candidates.length; ii++) {
					var candidateIndex = candidates.indexOf(candidates[ii]);
					if (candidateIndex !== -1 && candidateIndex < ii) {
						this.stateControl("initCandidate");
					} else this.addDomainCandidate(candidates[ii], this.stateControl.bind(this, "initCandidate"));
				}
				this.stateControl("initCandidate");
			}
			fs.open(this.path, "a", this.setFile.bind(this));
		}).bind(this));
	} else {
		this.stateControl("file");
	}*/
	var domainEntries = fs.readdirSync("./domains");
	//console.log(domainEntries);
	this.initCandidates = domainEntries.length + 1;
	//console.log(this.initCandidates);
	for (var ii = 0; ii < domainEntries.length; ii++) {
		let name = domainEntries[ii].replace(/^(.+)\.txt$/g, "$1");
		if (name === null) this.stateControl("initCandidate");
		else this.addDomainCandidate(name, false, this.stateControl.bind(this, "initCandidate"));
	}
	this.stateControl("initCandidate");
}
DomainData.prototype.stateControl = function (event) {
	console.log("stateControl called with " + event, this.initCandidates);
	if (event === "initCandidate") this.initCandidates--;
	if (this.initCandidates === 0) this.initCallback();
}
DomainData.prototype.parseDomain = function (domain) {
	return domain.match(/^([^\s]+\.|)ed\.ac\.uk$/g);
}
DomainData.prototype.dnsDomain = function (domain, callback) {
	if (this.domains[domain] !== undefined && (Date.now() - 100000) > this.domains[domain].dnsLastCheck && this.domains[domain].dnsLock !== true) this.domains[domain].checkDns(this.dnsDomainResponse.bind(this, callback));
	else if (Date.now() - 100000 < this.domains[domain].dnsLastCheck) {
		var res = {
			"state": 1,
			"data": {
				"dns": this.domains[domain].dns,
				"dnsLastCheck": this.domains[domain].dnsLastCheck
			}
		}
		callback(JSON.stringify(res));
	} else callback(JSON.stringify({"state": 2}));
}
DomainData.prototype.dnsDomainResponse = function (callback, dns, dnsLastCheck) {
	var res = {
		"state": 0,
		"data": {
			"dns": dns,
			"dnsLastCheck": dnsLastCheck
		}
	}
	callback(JSON.stringify(res));
}
DomainData.prototype.pingDomain = function (domain, callback) {
	if (this.domains[domain] !== undefined && (Date.now() - 100000) > this.domains[domain].pingLastCheck && this.domains[domain].pingLock !== true) this.domains[domain].checkPing(this.pingDomainResponse.bind(this, callback));
	else if (Date.now() - 100000 < this.domains[domain].pingLastCheck) {
		var res = {
			"state": 1,
			"data": {
				"ping": this.domains[domain].ping,
				"pingLastCheck": this.domains[domain].pingLastCheck
			}
		}
		callback(JSON.stringify(res));
	} else callback(JSON.stringify({"state": 2}));
}
DomainData.prototype.pingDomainResponse = function (callback, ping, pingLastCheck) {
	var res = {
		"state": 0,
		"data": {
			"ping": ping,
			"pingLastCheck": pingLastCheck
		}
	}
	callback(JSON.stringify(res));
}
DomainData.prototype.httpDomain = function (domain, callback) {
	console.log(this.domains[domain], this.domains[domain].httpLock);
	console.log(((Date.now() - 100000) > this.domains[domain].httpLastCheck), Date.now() - 100000, this.domains[domain].httpLastCheck, (this.domains[domain].httpLock !== true));
	if (this.domains[domain] !== undefined && (Date.now() - 100000) > this.domains[domain].httpLastCheck && this.domains[domain].httpLock !== true) this.domains[domain].checkHttp(this.httpDomainResponse.bind(this, callback));
	else if (Date.now() - 100000 < this.domains[domain].httpLastCheck) {
		var res = {
			"state": 1,
			"data": {
				"http": this.domains[domain].http,
				"httpLastCheck": this.domains[domain].httpLastCheck
			}
		}
		callback(JSON.stringify(res));
	} else callback(JSON.stringify({"state": 2}));
}
DomainData.prototype.httpDomainResponse = function (callback, http, httpLastCheck) {
	var res = {
		"state": 0,
		"data": {
			"http": http,
			"httpLastCheck": httpLastCheck
		}
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
	console.log(arguments);
	if (dns !== true) {
		delete this.domains[domain];
		callback(JSON.stringify({"state": 2}));
	} else {
		this.domains[domain].checkPing();
		this.domains[domain].checkHttp();
		callback(JSON.stringify({"state": 0, "data": this.domains[domain].toJson()}));
	}
}
DomainData.prototype.getJson = function () {
	//return JSON.stringify(this.domains);
	var res = [];
	console.log("getJson started...");
	for (var index in this.domains) {
		//res[this.domains[index].domainName] = this.domains[index].toJson();
		if (this.domains[index].initDone === false) continue;
		res.push(this.domains[index].toJson());
	}
	//console.log(res, JSON.stringify(res));
	return JSON.stringify(res);
}
var domData = new DomainData("domains.txt", function () {
	console.log("initCallback started");
	console.log(domData.domains);
	console.log(domData.getJson());
	var server = new http.createServer(function (req, res) {
		var parsedUrl = url.parse(req.url, true);
		if (parsedUrl.pathname === "/" || parsedUrl.pathname === "/index.html") {
			//res.end(fs.readFileSync("index.html"));
			fs.readFile("index.html", writeFileToRes.bind(this, res));
		} else if (parsedUrl.pathname === "/add" || parsedUrl.pathname === "/add/index.html") {
			//domData.dnsDomain(parsedUrl.query.domain, res.end.bind(true));
			domData.addDomainCandidate(parsedUrl.query.domain, true, res.end.bind(res));
		} else if (parsedUrl.pathname === "/dns" || parsedUrl.pathname === "/dns/index.html") {
			domData.dnsDomain(parsedUrl.query.domain, res.end.bind(res));
			//domData.addDomainCandidate(parsedUrl.query.domain, true, res.end.bind(res));
		} else if (parsedUrl.pathname === "/ping" || parsedUrl.pathname === "/ping/index.html") {
			domData.pingDomain(parsedUrl.query.domain, res.end.bind(res));
			//domData.addDomainCandidate(parsedUrl.query.domain, true, res.end.bind(res));
		} else if (parsedUrl.pathname === "/http" || parsedUrl.pathname === "/http/index.html") {
			domData.httpDomain(parsedUrl.query.domain, res.end.bind(res));
			//domData.addDomainCandidate(parsedUrl.query.domain, true, res.end.bind(res));
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
