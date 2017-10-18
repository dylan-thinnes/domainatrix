const dns = require('dns');
const http = require('http');
const ping = require('ping');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const RemoteProperty = require('./remoteproperty');

class Domain {
	constructor (domainName, isNew, initCallback, db, data) {
		this.domainName = domainName;
		this.isNew = isNew;
		this.initDone = false;
		this.db = db;
		this.dns = new RemoteProperty(this.domainName, function (callback) {
			dns.lookup(this.domainName, callback.bind(this));
		}, function (err, res) {
			var dns = err ? 1 : 0;
			return dns;
		}, this.writeState.bind(this));
		this.ping = new RemoteProperty(this.domainName, function (callback) {
			ping.sys.probe(this.domainName, callback.bind(this));
		}, function (pingExists) {
			var ping = pingExists ? 0 : 1;
			return ping;
		}, this.writeState.bind(this));
		this.http = new RemoteProperty(this.domainName, function (callback) {
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
			http = http ? 0 : 1;
			return http;
		}, this.writeState.bind(this));
		if (this.isNew === true) {
			this.dns.check(initCallback, this.finishInit.bind(this, "dns"));
		} else {
			//this.parseState(initCallback, undefined, data);
			//this.readState(initCallback);
		}
	}
	finishInit () {
		if (this.initDone === false) {
			if (this.isNew === true) {
				this.http.check();
				this.ping.check();
			}
			this.initDone = true;
		}
	}

	readState(callback) {
		this.callback = callback ? callback : ()=>{};
		fs.readFile("domains/" + this.domainName + ".txt", "utf8", this.parseState.bind(this, callback));
	}

	parseState (callback, err, res) {
		if (err) return;
		else {
			var resJson = res;
			console.log(res);
			if (resJson.dns === undefined) this.dns.check(callback, this.finishInit.bind(this, "dns"));
			else {
				this.ping.state = resJson.ping !== undefined && resJson.ping !== -1 ? resJson.ping : this.ping.state;
				this.dns.state = resJson.dns !== undefined && resJson.dns !== -1 ? resJson.dns : this.dns.state;
				this.http.state = resJson.http !== undefined && resJson.http !== -1 ? resJson.http : this.http.state;
				this.ping.lastCheck = resJson.pingLastCheck !== undefined ? resJson.pingLastCheck : this.ping.lastCheck;
				this.dns.lastCheck = resJson.dnsLastCheck !== undefined ? resJson.dnsLastCheck : this.dns.lastCheck;
				this.http.lastCheck = resJson.httpLastCheck !== undefined ? resJson.httpLastCheck : this.http.lastCheck;
				this.finishInit("dns");
				//this.writeState();
				callback(this.dns.state);
			}
		}
	}

	toJson () {
		return {
			domainName: this.domainName,
			dns: {
				state: this.dns.state,
				lastCheck: this.dns.lastCheck
			},
			ping: {
				state: this.ping.state,
				lastCheck: this.ping.lastCheck
			},
			http: {
				state: this.http.state,
				lastCheck: this.http.lastCheck
			}
		}
	}
	toDb () {
		return {
			$domainName: this.domainName,
			$dns: this.dns.state,
		    $ping: this.ping.state,
			$http: this.http.state,
			$dnsLastCheck: this.dns.lastCheck,
		    $pingLastCheck: this.ping.lastCheck,
			$httpLastCheck: this.http.lastCheck
		}
	}
	writeState () {
		//console.log(this.toDb());
		//this.db.run("INSERT INTO domains VALUES ($domainName, $dns, $dnsLastCheck, $ping, $pingLastCheck, $http, $httpLastCheck)", this.toDb());
		this.db.run("UPDATE domains SET dns = $dns, dnsLastCheck = $dnsLastCheck, ping = $ping, pingLastCheck = $pingLastCheck, http = $http, httpLastCheck = $httpLastCheck WHERE domainName = $domainName", this.toDb());
		//fs.writeFile("domains/" + this.domainName + ".txt", JSON.stringify(this.toJson()), () => {});
	}
}
exports = module.exports = Domain;
