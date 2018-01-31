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
    this.children = new RemoteProperty(this.writeState.bind(this, "children"), this.getRemoteChildren.bind(this));
    this.addDomainCandidates = addDomainCandidates;
    this.childCandidates = [];
}
exports = module.exports = Domain;

Domain.prototype.getRemoteChildren = async function (resolve, reject) {
    var childrenString = " ";
    await Promise.all([
        this.dns.update(),
        this.http.update()
    ]);

    for (var rrtype in this.dns.value) {
        var records = this.dns.value[rrtype];
        for (var jj in records) {
            if (rrtype === "A" || rrtype === "AAAA" || rrtype === "CNAME" || rrtype === "PTR" || rrtype === "NS") childrenString += records[jj] + " ";
            else if (rrtype === "TXT") childrenString += records[jj].join(" ") + " ";
            else if (rrtype === "SRV") childrenString += records[jj].name + " ";
            else if (rrtype === "SOA") {
                childrenString += records[jj].nsname + " ";
                childrenString += records[jj].hostmaster + " ";
            }
            else if (rrtype === "NAPTR") childrenString += records[jj].replacement + " ";
            else if (rrtype === "MX") childrenString += records[jj].exchange + " ";
        }
    }
    if (this.http.additionalData != undefined) childrenString += this.http.additionalData + " ";

    var newChildrenCandidates = await this.addDomainCandidates(childrenString);
    var newChildren = [];
    for (var ii in newChildren) {
        var child = newChildren[ii];
        if (child.state === 0) newChildren.push(child.name);
    }
    resolve([newChildren]);
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
            resultExists = true;
        }
        if (resultExists) resolve([finalResults]);
        else resolve();
    }).bind(this));
}
Domain.prototype.getRemotePing = function (resolve, reject) {
    ping.promise.probe(this.name, {
        extra: ["-c", "40"] // System specific options to make the ping check make 40 requests.
    }).then((res) => {
        if (!res.alive) resolve();
        var latency = Math.floor(parseFloat(res.avg) * 1000);
        resolve([latency]);
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
    req.on("error", (res) => { resolve([statusCode]); }); // Catches socket abortion error
    req.on("abort", (res) => { resolve([statusCode]); });
    req.on("timeout", (res) => { resolve([statusCode]); });
    req.on("response", (function (res) {
        statusCode = res.statusCode;
        resolve([statusCode, res.headers.location]);
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
    params["$prop"] = (propertyName === "dns" || propertyName === "children") ? JSON.stringify(this[propertyName].value) : this[propertyName].value;
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
    this.children.value = data.children;
    this.children.state = data.childrenHttp;
    this.children.lastUpdate = data.childrenLastUpdate;
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
