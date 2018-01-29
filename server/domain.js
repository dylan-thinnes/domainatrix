const dns = require('dns');
const http = require('http');
const ping = require('ping');
const RemoteProperty = require('./remoteproperty');

var Domain = function (name, db) {
    this.name = name;
    this.db = db;
    this.dns =  new RemoteProperty(this.writeState.bind(this, "dns"),  this.getRemoteDns.bind(this));
    this.ping = new RemoteProperty(this.writeState.bind(this, "ping"), this.getRemotePing.bind(this));
    this.http = new RemoteProperty(this.writeState.bind(this, "http"), this.getRemoteHttp.bind(this));
}
exports = module.exports = Domain;

Domain.prototype.getRemoteDns = function (resolve, reject) {
    var name = this.name;
    var promisedDnsResolve = function (rrtype) {
        return new Promise((resolve, reject) => {
            dns.resolve(name, rrtype, (err, res) => {
                if (err != undefined) resolve();
                else resolve({ type: rrtype, records: res });
            });
        });
    }
    Promise.all([
        promisedDnsResolve("A"),
        promisedDnsResolve("AAAA"),
        promisedDnsResolve("CNAME"),
        promisedDnsResolve("MX"),
        promisedDnsResolve("NS"),
        promisedDnsResolve("SOA"),
        promisedDnsResolve("SRV"),
        promisedDnsResolve("TXT"),
        promisedDnsResolve("NAPTR"),
        promisedDnsResolve("PTR")
    ]).then((results) => {
        var resultExists = false;
        console.log(results);
        var finalResults = {};
        for (var ii in results) {
            if (results[ii] == undefined || results[ii].records.length === 0) continue;
            finalResults[results[ii].type] = results[ii].records;
            resultExists = true;
        }
        if (resultExists) resolve(finalResults);
        else resolve();
    });
}
Domain.prototype.getRemotePing = function (resolve, reject) {
    ping.promise.probe(this.name, {
        extra: ["-c", "40"] // System specific options to make the ping check make 40 requests.
    }).then((res) => {
        if (!res.alive) resolve();
        var latency = Math.floor(parseFloat(res.avg) * 1000);
        resolve(latency);
    });
}
Domain.prototype.getRemoteHttp = function (resolve, reject) {
    var req = http.request({
        host: this.name,
        hostname: this.name,
        path: "/",
        port: 80,
        method: "HEAD"
    });
    setTimeout(() => {
        resolve();
        req.abort();
    }, 10000);
    req.on("error", (res) => { resolve(); }); // Catches socket abortion error
    req.on("abort", (res) => { resolve(); });
    req.on("timeout", (res) => { resolve(); });
    req.on("response", (res) => { resolve(res.statusCode); });
    req.end();
}

Domain.prototype.toJson = function () {
    return {
        name: this.name,
        dns: {
            value: this.dns.value,
            state: this.dns.state,
            lastUpdate: this.dns.lastUpdate
        },
        ping: {
            value: this.ping.value,
            state: this.ping.state,
            lastUpdate: this.ping.lastUpdate
        },
        http: {
            value: this.http.value,
            state: this.http.state,
            lastUpdate: this.http.lastUpdate
        }
    }
}
Domain.prototype.toDb = function (propertyName) {
    var res = { $name: this.name }
    res["$prop"] = this[propertyName].state;
    res["$propLastUpdate"] = this[propertyName].lastUpdate;
    return res;
}

Domain.prototype.setFromDb = function (data) {
    this.dns.state = data.dns;
    this.dns.lastUpdate = data.dnsLastUpdate;
    this.ping.state = data.ping;
    this.ping.lastUpdate = data.pingLastUpdate;
    this.http.state = data.http;
    this.http.lastUpdate = data.httpLastUpdate;
}

Domain.prototype.writeState = async function (propertyName) {
    var dbParams = this.toDb(propertyName);
    await this.db.aRun("UPDATE domains SET " + propertyName + " = $prop, " + propertyName + "LastUpdate = $propLastUpdate WHERE name = $name", dbParams);
}
Domain.prototype.delete = async function () {
    await this.db.aRun("DELETE FROM domains WHERE name = $name", {$name: this.name});
}
