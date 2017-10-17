const dns = require('dns');
const http = require('http');
const fs = require('fs');
const RemoteProperty = require('./remoteproperty');

class Domain {
	constructor (domainName, isNew, initCallback) {
		this.domainName = domainName;
		this.isNew = isNew;
		this.initDone = false;
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
		} else this.readState(initCallback);
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
			try {
				var resJson = JSON.parse(res);
				if (resJson.dns === undefined) this.dns.check(callback, this.finishInit.bind(this, "dns"));
				else {
					this.ping.state = resJson.ping.state !== undefined && resJson.ping.state !== -1 ? resJson.ping.state : this.ping.state;
					this.dns.state = resJson.dns.state !== undefined && resJson.dns.state !== -1 ? resJson.dns.state : this.dns.state;
					this.http.state = resJson.http.state !== undefined && resJson.http.state !== -1 ? resJson.http.state : this.http.state;
					this.ping.lastCheck = resJson.ping.lastCheck !== undefined ? resJson.ping.lastCheck : this.ping.lastCheck;
					this.dns.lastCheck = resJson.dns.lastCheck !== undefined ? resJson.dns.lastCheck : this.dns.lastCheck;
					this.http.lastCheck = resJson.http.lastCheck !== undefined ? resJson.http.lastCheck : this.http.lastCheck;
					this.finishInit("dns");
					//this.writeState();
					callback(this.dns.state);
				}
			} catch (e) {
				console.log(e);
				return e;
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
	writeState () {
		fs.writeFile("domains/" + this.domainName + ".txt", JSON.stringify(this.toJson()), () => {});
	}
}
exports = module.exports = Domain;
