const dns = require('dns');
const http = require('http');
const ping = require('ping');
const RemoteProperty = require('./remoteproperty');
const DomainData = require('./domaindata');

var Domain = function (name, db, addDomainCandidates) {
    this.name = name;
    this.db = db;
    this.dns =  new RemoteProperty(this.writeState.bind(this, "dns"),  this.getRemoteDns.bind(this));
    this.ping = new RemoteProperty(this.writeState.bind(this, "ping"), this.getRemotePing.bind(this));
    this.http = new RemoteProperty(this.writeState.bind(this, "http"), this.getRemoteHttp.bind(this));
    this.addDomainCandidates = addDomainCandidates;
    this.children = [];
}
exports = module.exports = Domain;

Domain.prototype.addChild = async function (name) {
    console.log("Searching for children of name ", name);
    var newChildren = await this.addDomainCandidates(name);
    console.log("Total of " + newChildren.length + " children found.");
    console.log(newChildren);
}
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
    ]).then((function (results) {
        var resultExists = false;
        var finalResults = {};
        for (var ii in results) {
            if (results[ii] == undefined || results[ii].records.length === 0) continue;
            finalResults[results[ii].type] = results[ii].records;
            var type = results[ii].type;
            var records = finalResults[results[ii].type];
            for (var jj in records) {
                if (type === "A" || type === "AAAA" || type === "CNAME" || type === "PTR" || type === "NS") this.addChild(records[jj]);
                else if (type === "TXT") this.addChild(records[jj].join(" "));
                else if (type === "SRV") this.addChild(records[jj].name);
                else if (type === "SOA") {
                    this.addChild(records[jj].nsname);
                    this.addChild(records[jj].hostmaster);
                }
                else if (type === "NAPTR") this.addChild(records[jj].replacement);
                else if (type === "MX") this.addChild(records[jj].exchange);
            }
            resultExists = true;
        }
        if (resultExists) resolve(finalResults);
        else resolve();
    }).bind(this));
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
    var statusCode;
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
    req.on("error", (res) => { resolve(statusCode); }); // Catches socket abortion error
    req.on("abort", (res) => { resolve(statusCode); });
    req.on("timeout", (res) => { resolve(statusCode); });
    req.on("response", (function (res) {
        statusCode = res.statusCode;
        if (statusCode >= 300 && statusCode < 400 && res.headers.location != undefined) this.addChild(res.headers.location);
        resolve(statusCode);
    }).bind(this));
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
    var params = { $name: this.name }
    params["$prop"] = propertyName === "dns" ? JSON.stringify(this[propertyName].value) : this[propertyName].value;
    params["$propState"] = this[propertyName].state;
    params["$propLastUpdate"] = this[propertyName].lastUpdate;
    return params;
}

Domain.prototype.setFromDb = function (data) {
    this.dns.value = JSON.parse(data.dns);
    this.dns.state = data.dnsState;
    this.dns.lastUpdate = data.dnsLastUpdate;
    this.ping.value = data.ping;
    this.ping.state = data.pingState;
    this.ping.lastUpdate = data.pingLastUpdate;
    this.http.value = data.http;
    this.http.state = data.httpState;
    this.http.lastUpdate = data.httpLastUpdate;
}

Domain.prototype.writeState = async function (propertyName) {
    var dbParams = this.toDb(propertyName);
    await this.db.aRun("UPDATE domains SET " + propertyName + " = $prop, " + propertyName + "State = $propState, " + propertyName + "LastUpdate = $propLastUpdate WHERE name = $name", dbParams);
}
Domain.prototype.delete = async function () {
    await this.db.aRun("DELETE FROM domains WHERE name = $name", {$name: this.name});
}
Domain.prototype.create = async function () {
    await this.db.aRun("INSERT INTO domains VALUES ($name, $f, $f, $f, $f, $f, $f, $f, $f, $f)", {
        $name: this.name,
        $f: 0
    });
}
