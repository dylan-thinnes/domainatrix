const fs = require('fs');
const Domain = require('./domain');

class DomainData {
	
	constructor (path, initCallback) {
		this.domains = {}; 
		this.initCallback = initCallback;
		var domainEntries = fs.readdirSync("./domains");
		//console.log(domainEntries);
		this.initCandidates = domainEntries.length + 1;
		this.total = domainEntries;
		for (var ii = 0; ii < domainEntries.length; ii++) {
			let name = domainEntries[ii].replace(/^(.+)\.txt$/g, "$1");
			if (name === null) this.callbackControl("initCandidate");
			else this.addDomainCandidate(name, false, this.callbackControl.bind(this, "initCandidate", ii, name));
		}
		this.callbackControl("initCandidate");
	}
	callbackControl(event, index, name) {
		if (event === "initCandidate") {
			this.initCandidates--;
		}
		if (this.initCandidates === 0) this.initCallback();
	}
	parseDomain(domain) {
		return domain.match(/^([^\s]+\.|)ed\.ac\.uk$/g);
	}

	getXFromDomain(x, domain, callback) {
		if (this.domains[domain] !== undefined) this.domains[domain][x].check(this.writeXFromDomain.bind(this, x, domain, callback));
		else callback({"state": 2});
	}
	writeXFromDomain(x, domain, callback, state) {
		var res = {};
		res[x] = {};
		res[x]["state"] = state;
		res[x]["lastCheck"] = this.domains[domain][x].lastCheck
		callback(res);
	}

	addDomainCandidate(domain, isNew, callback) {
		var parsedDomain = this.parseDomain(domain);
		if (parsedDomain !== null) {
			if (this.domains[domain] !== undefined) callback({"state": 1});
			else {
				var subDomain = parsedDomain[1];
				this.domains[domain] = new Domain(domain, isNew, this.parseCandidate.bind(this, domain, callback));
			}
		} else callback({"state": 3});
	}
	parseCandidate(domain, callback, dns) {
		if (dns !== 0) {
			delete this.domains[domain];
			callback({"state": 2});
		} else {
			/*this.domains[domain].checkPing();
			this.domains[domain].checkHttp();*/
			callback({"state": 0, "data": this.domains[domain].toJson()});
		}
	}
	getJson (){
		//return JSON.stringify(this.domains);
		var res = [];
		for (var index in this.domains) {
			//res[this.domains[index].domainName] = this.domains[index].toJson();
			if (this.domains[index].initDone === false) continue;
			res.push(this.domains[index].toJson());
		}
		return res;
	}
}
exports = module.exports = DomainData;
