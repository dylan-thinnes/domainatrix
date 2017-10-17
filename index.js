const dns = require("dns");
const http = require("http");
const url = require("url");
const fs = require("fs");
const ping = require("ping");
const writeFileToRes = function (res, err, file) {
	if (err) {
		res.writeHead(404);
		res.end("index.html not found.");
	} else {
		res.end(file);
	}
}

const DomainData = require('./server/domaindata');

var domData = new DomainData("domains.txt", function () {
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
	server.listen(8080);
});
