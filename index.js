var dns = require("dns");
var http = require("http");
var url = require("url");
var fs = require("fs");

var DomainData = function (path, initCallback) {
	this.domains = []; 
	this.path = path;
	this.initCallback = initCallback;
	this.newWrite = false;
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
	}
}
DomainData.prototype.stateControl = function (event) {
	if (event === "file") this.fileSet = true;
	if (event === "initCandidate") this.initCandidates--;

	if (this.fileSet && this.initCandidates === 0) this.initCallback();
}
DomainData.prototype.setFile = function (err, fd) {
	this.file = fd;
	this.stateControl("file");
}
DomainData.prototype.addDomainCandidate = function (domain, callback) {
	console.log(this.domains, domain);
	var parsedDomain = domain.match(/([^\s]+\.|)ed\.ac\.uk$/g);
	if (parsedDomain !== null) {
		if (this.domains.indexOf(domain) !== -1) callback(JSON.stringify({"state": 1}));
		else {
			var subDomain = parsedDomain[1];
			dns.lookup(domain, this.lookupDomain.bind(this, domain, callback));
		}
	} else callback(JSON.stringify({"state": 3}));
}
DomainData.prototype.lookupDomain = function (domain, callback, err, ip) {
	if (err) callback(JSON.stringify({"state": 2}));
	else this.addDomain(domain, callback);
}
DomainData.prototype.addDomain = function (domain, callback) {
	this.domains.push(domain);
	this.writeDomain(domain);
	callback(JSON.stringify({"state": 0, "domain": domain}));
}
DomainData.prototype.writeDomain = function (domain) {
	if (this.file !== undefined) fs.write(this.file, (this.newWrite ? "" : "\n") + domain, () => {});
	if (this.newWrite === true) this.newWrite = false;
}
DomainData.prototype.getDomains = function () {
	return JSON.stringify(this.domains);
}
var domData = new DomainData("domains.txt", function () {
	var server = new http.createServer(function (req, res) {
		var parsedUrl = url.parse(req.url, true);
		if (parsedUrl.pathname === "/" || parsedUrl.pathname === "/index.html") {
			res.end(fs.readFileSync("index.html"));
		} else if (parsedUrl.pathname === "/add" || parsedUrl.pathname === "/add/index.html") {
			domData.addDomainCandidate(parsedUrl.query.domain, res.end.bind(res));
		} else if (parsedUrl.pathname === "/data" || parsedUrl.pathname === "/data/index.html") {
			res.end(domData.getDomains());
		} else {
			res.end();
		}
	});
	server.listen(8080);
	console.log(this.getDomains());
});
