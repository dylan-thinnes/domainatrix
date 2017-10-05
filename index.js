var dns = require("dns");
var http = require("http");
var url = require("url");
var fs = require("fs");

var DomainData = function (path, initCallback) {
	this.domains = []; 
	this.path = path;
	this.initCallback = initCallback;
	this.newWrite = false;
	if (typeof this.path === "string") {
		fs.readFile(this.path, "utf8", (function (err, res) {
			if (err) {
				//console.log("Creating new file for IdDictionary.");
				this.newWrite = true;
			} else {
				//console.log(res, res.split("\n"));
				this.domains = this.domains.concat(res.split("\n"));
				this.domains.pop();
			}
			fs.open(this.path, "a", this.setFile.bind(this));
		}).bind(this));
	} else {
		this.initCallback();
	}
}
DomainData.prototype.setFile = function (err, fd) {
	this.file = fd;
	this.initCallback();
}
DomainData.prototype.addDomainCandidate = function (domain, submitter, callback) {
	var parsedDomain = domain.match(/([^\s]+\.|)ed\.ac\.uk$/g);
	if (domain !== null && this.domains.indexOf(domain) === -1) {
		var subDomain = parsedDomain[1];
		dns.lookup(domain, this.lookupDomain.bind(this, domain, callback));
	} else callback(JSON.stringify({"accepted": "true", "domain": domain}));
}
DomainData.prototype.lookupDomainCallback = function (domain, callback, err, ip) {
	if (err) callback(JSON.stringify({"accepted": "true", "domain": domain}));
	else this.addDomain(domain, callback);
}
DomainData.prototype.addDomain = function (domain, callback) {
	this.domains.push(domain);
	this.writeDomain();
	callback(JSON.stringify({"accepted": "true", "domain": domain}));
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
			domData.addDomain(parsedUrl.query.domain, parsedUrl.query.submitter, res.end.bind(res));
		} else if (parsedUrl.pathname === "/data" || parsedUrl.pathname === "/data/index.html") {
		
		} else {
			res.end();
		}
	});
	server.listen(8080);
	//console.log(this.getDomains());
});
