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
	if (this.isNew) this.check(initCallback);
	else this.readState(initCallback);
}
Domain.prototype.done = function (e) {
	if (e === "dns") this.dnsDone = true;
	else if (e === "ping") this.pingDone = true;
	
	if (this.dnsDone === true && this.pingDone === true) {
		if (this.isNew) this.writeState();
		this.callback(this.dns, this.ping);
	}
}
Domain.prototype.check = function (callback) {
	this.callback = callback ? callback : ()=>{};
	this.dnsDone = false;
	this.pingDone = false;
	this.checkDns();
	this.checkPing();
}
Domain.prototype.checkDns = function (callback) {
	dns.lookup(this.domainName, this.setDns.bind(this, callback));
}
Domain.prototype.checkPing = function (callback) {
	ping.sys.probe(this.domainName, this.setPing.bind(this, callback));
}
Domain.prototype.setDns = function (callback, err, res) {
	this.dns = err ? false : true;
	this.dnsLastCheck = Date.now();
	if (callback) callback(this.dns);
	this.done("dns");
}
Domain.prototype.setPing = function (callback, pingExists) {
	this.ping = pingExists ? true : false;
	this.pingLastCheck = Date.now();
	if (callback) callback(this.ping);
	this.done("ping");
}
Domain.prototype.readState = function (callback) {
	this.callback = callback ? callback : ()=>{};
	this.dnsDone = false;
	this.pingDone = false;
	fs.readFile("domains/" + this.domainName + ".txt", this.parseState.bind(this, callback));
}
Domain.prototype.parseState = function (callback, err, res) {
	if (err) return;
	else {
		try {
			var resJson = JSON.parse(res);
			this.ping = resJson.ping;
			this.dns = resJson.dns;
			this.pingLastCheck = resJson.pingLastCheck;
			this.dnsLastCheck = resJson.dnsLastCheck;
			this.done("dns");
			this.done("ping");
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
		pingLastCheck: this.pingLastCheck,
		dnsLastCheck: this.dnsLastCheck
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
		else this.addDomainCandidate(name, this.stateControl.bind(this, "initCandidate"));
	}
	this.stateControl("initCandidate");
}
DomainData.prototype.stateControl = function (event) {
	//console.log("stateControl called with " + event);
	if (event === "initCandidate") this.initCandidates--;
	if (this.initCandidates === 0) this.initCallback();
}
DomainData.prototype.addDomainCandidate = function (domain, callback) {
	//console.log(this.domains, domain);
	var parsedDomain = domain.match(/^([^\s]+\.|)ed\.ac\.uk$/g);
	if (parsedDomain !== null) {
		if (this.domains[domain] !== undefined) callback(JSON.stringify({"state": 1}));
		else {
			var subDomain = parsedDomain[1];
			//dns.lookup(domain, this.lookupDomain.bind(this, domain, callback));
			this.domains[domain] = new Domain(domain, true, this.parseCandidate.bind(this, domain, callback));
		}
	} else callback(JSON.stringify({"state": 3}));
}
DomainData.prototype.parseCandidate = function (domain, callback, dns, ping) {
	if (dns === false) {
		delete this.domains[domain];
		callback(JSON.stringify({"state": 2}));
	} else callback(JSON.stringify({"state": 0}));
}
DomainData.prototype.lookupDomain = function (domain, callback, err, ip) {
	if (err) callback(JSON.stringify({"state": 2}));
	else this.addDomain(domain, callback);
}
DomainData.prototype.addDomain = function (domain, callback) {
	if (this.domains.indexOf(domain) === -1) {
		this.domains.push(domain);
		this.writeDomain(domain);
	}
	callback(JSON.stringify({"state": 0, "domain": domain}));
}
DomainData.prototype.writeDomain = function (domain) {
	if (this.file !== undefined) fs.write(this.file, (this.newWrite ? "" : "\n") + domain, () => {});
	if (this.newWrite === true) this.newWrite = false;
}
DomainData.prototype.getJson = function () {
	//return JSON.stringify(this.domains);
	var res = [];
	for (var index in this.domains) {
		//res[this.domains[index].domainName] = this.domains[index].toJson();
		res.push(this.domains[index].toJson());
	}
	//console.log(res, JSON.stringify(res));
	return JSON.stringify(res);
}
var domData = new DomainData("domains.txt", function () {
	var server = new http.createServer(function (req, res) {
		var parsedUrl = url.parse(req.url, true);
		if (parsedUrl.pathname === "/" || parsedUrl.pathname === "/index.html") {
			//res.end(fs.readFileSync("index.html"));
			fs.readFile("index.html", writeFileToRes.bind(this, res));
		} else if (parsedUrl.pathname === "/add" || parsedUrl.pathname === "/add/index.html") {
			domData.addDomainCandidate(parsedUrl.query.domain, res.end.bind(res));
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
