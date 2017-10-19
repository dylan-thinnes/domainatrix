const fs = require('fs');
const sqlite3 = require('sqlite3');
const Domain = require('./domain');

class DomainData {
	
	constructor (path, initCallback) {
		this.domains = {}; 
		this.initCallback = initCallback;
		var domainEntries = fs.readdirSync("./domains");
		this.db = new sqlite3.Database("app.db");
		this.db.exec(`CREATE TABLE IF NOT EXISTS domains (
			domainName TEXT PRIMARY KEY,
			dns INTEGER NOT NULL,
			dnsLastCheck INTEGER NOT NULL,
			ping INTEGER NOT NULL,
			pingLastCheck INTEGER NOT NULL,
			http INTEGER NOT NULL,
			httpLastCheck INTEGER NOT NULL
		)`);
		this.db.all("SELECT * FROM domains", this.parseExistingCandidates.bind(this));
	}
	parseExistingCandidates(err, res) {
		this.initCandidates = res.length + 1;
		for (var ii = 0; ii < res.length; ii++) {
			this.addDomainCandidate(res[ii]["domainName"], false, this.callbackControl.bind(this, "initCandidate"), res[ii]);
		}
		this.callbackControl("initCandidate");
	}
	callbackControl(event) {
		if (event === "initCandidate") {
			this.initCandidates--;
		}
		if (this.initCandidates === 0) {
			this.initCallback();
		}
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

	addDomainCandidate(domain, isNew, callback, data) {
		var parsedDomain = this.parseDomain(domain);
		if (parsedDomain !== null) {
			if (this.domains[domain] !== undefined) callback({"state": 1});
			else {
				var subDomain = parsedDomain[1];
				if (isNew !== false) {
					this.domains[domain] = new Domain(domain, isNew, this.parseCandidate.bind(this, domain, callback), this.db);
				} else {
					this.domains[domain] = new Domain(domain, isNew, ()=>{}, this.db);
					this.domains[domain].parseState(this.parseCandidate.bind(this, domain, callback), undefined, data);
				}
			}
		} else callback({"state": 3});
	}
	parseCandidate(domain, callback, dns) {
		if (dns !== 0) {
			delete this.domains[domain];
			callback({"state": 2});
		} else {
			callback({"state": 0, "data": this.domains[domain].toJson()});
		}
	}
	getJson (){
		var res = [];
		for (var index in this.domains) {
			if (this.domains[index].initDone === false) continue;
			res.push(this.domains[index].toJson());
		}
		return res;
	}
}
exports = module.exports = DomainData;
