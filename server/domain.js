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
    dns.lookup(this.name, (err, res) => {
        if (err != undefined) resolve(false);
        else resolve(true);
    });
}
Domain.prototype.getRemotePing = function (resolve, reject) {
    ping.sys.probe(this.name, (res) => {
        if (res) resolve(true);
        else resolve(false);
    });
}
Domain.prototype.getRemoteHttp = function (resolve, reject) {
    var connectionMade = false;
    var req = http.request({
        host: this.name,
        hostname: this.name,
        path: "/",
        port: 80,
        method: "HEAD"
    }, (res) => {
        connectionMade = true;
        resolve(connectionMade);
    });
    setTimeout(() => {
        resolve(connectionMade);
        req.abort();
    }, 10000);
    req.on("error", (res) => { resolve(connectionMade); }); // Catches socket abortion error
    req.on("abort", (res) => { resolve(connectionMade); });
    req.on("timeout", (res) => { resolve(connectionMade); });
    req.end();
}

Domain.prototype.toJson = function () {
    return {
        name: this.name,
        dns: {
            state: this.dns.get(),
            lastUpdate: this.dns.lastUpdate
        },
        ping: {
            state: this.ping.get(),
            lastUpdate: this.ping.lastUpdate
        },
        http: {
            state: this.http.get(),
            lastUpdate: this.http.lastUpdate
        }
    }
}
Domain.prototype.toDb = function (propertyName) {
    var res = { $name: this.name }
    res["$prop"] = this[propertyName].get();
    res["$propLastUpdate"] = this[propertyName].lastUpdate;
    return res;
}

Domain.prototype.setFromDb = function (data) {
    this.dns.value = data.dns;
    this.dns.lastUpdate = data.dnsLastUpdate;
    this.ping.value = data.ping;
    this.ping.lastUpdate = data.pingLastUpdate;;
    this.http.value = data.http;
    this.http.lastUpdate = data.httpLastUpdate;
}

Domain.prototype.writeState = async function (propertyName) {
    var dbParams = this.toDb(propertyName);
    await this.db.aRun("UPDATE domains SET " + propertyName + " = $prop, " + propertyName + "LastUpdate = $propLastUpdate WHERE name = $name", dbParams);
}
Domain.prototype.delete = async function () {
    await this.db.aRun("DELETE FROM domains WHERE name = $name", {$name: this.name});
}
