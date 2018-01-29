const url = require("url");
const Domain = require('./domain');
const abstractdb = require("abstractdb");
const Database = abstractdb("better-sqlite3");
const RemoteProperty = require("./remoteproperty");

var DomainData = function () {
    this.domains = {}; 
    this.orderedDomains = [];
    this.db = new Database(__dirname + "/app.db");
    this.db.sRun(`CREATE TABLE IF NOT EXISTS domains (
        name TEXT PRIMARY KEY,
        dns STRING,
        dnsState INTEGER NOT NULL,
        dnsLastUpdate INTEGER NOT NULL,
        ping STRING,
        pingState INTEGER NOT NULL,
        pingLastUpdate INTEGER NOT NULL,
        http STRING,
        httpState INTEGER NOT NULL,
        httpLastUpdate INTEGER NOT NULL,
        httpLastCheck INTEGER NOT NULL
    )`);
}
exports = module.exports = DomainData;

DomainData.prototype.init = async function () {
    var existingCandidates = this.db.sAll("SELECT * FROM domains ORDER BY name ASC");
    await this.parseExistingCandidates(existingCandidates);
    return;
}

DomainData.prototype.parseExistingCandidates = async function (res) {
    var candidacies = [];
    for (var ii = 0; ii < res.length; ii++) {
        candidacies[this.addDomainCandidate(res[ii]["name"], res[ii])];
    }
    await Promise.all(candidacies);
}

DomainData.prototype.edAcUkSearch = new RegExp(/(?![^A-Za-z0-9\-])([A-Za-z0-9\-\.]+\.|)ed\.ac\.uk(?=[^A-Za-z0-9\-])/g);
DomainData.prototype.extractDomains = function (searchString) {
    searchString = " " + searchString + " ";
    var matches = searchString.match(this.edAcUkSearch);
    for (var ii in matches) matches[ii] = matches[ii].toLowerCase();
    if (matches == undefined) matches = [];
    return matches;
}

DomainData.prototype.updateXFromDomain = function (x, domainName) { return this.getXFromDomain(x, domainName, true); } 
DomainData.prototype.getXFromDomain = async function (x, domainName, update) {
    var domain = this.domains[domainName];
    if (domain == undefined) return { "state": 2 };
    if (update === true) await domain[x].update();
    var res = {};
    res[x] = {};
    res[x]["value"] = domain[x].value;
    res[x]["state"] = domain[x].state;
    res[x]["lastUpdate"] = domain[x].lastUpdate;
    return res;
}

DomainData.prototype.findOrderedIndex = function (domain, subsetLeft, subsetRight) {
    subsetLeft = subsetLeft != undefined ? subsetLeft : 0;
    subsetRight = subsetRight != undefined ? subsetRight : this.orderedDomains.length;
    while (subsetLeft !== subsetRight) {
        var checkDomain = this.orderedDomains[subsetLeft + Math.floor((subsetRight - subsetLeft) / 2)];
        if (checkDomain > domain) subsetRight = subsetLeft + Math.floor((subsetRight - subsetLeft) / 2);
        else subsetLeft = subsetRight - Math.floor((subsetRight - subsetLeft) / 2);
    }
    return subsetLeft;
}

DomainData.prototype.addDomainCandidates = async function (s) {
    var names = this.extractDomains(s);
    var candidates = [];
    for (var ii in names) candidates.push(this.addDomainCandidate(names[ii]));
    return await Promise.all(candidates);
}
DomainData.prototype.addDomainCandidate = async function (name, data) {
    if (this.domains[name] != undefined) return { "name": name, "state": 1 };

    var candidate = new Domain(name, this.db);
    if (data != undefined && typeof data === "object") candidate.setFromDb(data);
    else {
        await candidate.dns.update();
        if (candidate.dns.get() === RemoteProperty.DOES_NOT_EXIST) {
            candidate.delete();
            delete candidate;
            return { "name": name, "state": 2};
        }
    }
    this.domains[name] = candidate;
    this.orderedDomains.splice(this.findOrderedIndex(name), 0, name);
    return { "name": name, "state": 0, "data": candidate.toJson() };
}

DomainData.prototype.getJson = function (name) {
    if (name != undefined) {
        if (this.domains[name] == undefined) return;
        return this.domains[name].toJson();
    }
    var res = [];
    for (var ii = 0; ii < this.orderedDomains.length; ii++) {
        var index = this.orderedDomains[ii];
        if (this.domains[index].initDone === false) continue;
        res.push(this.domains[index].toJson());
    }
    return res;
}
