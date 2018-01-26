const Domain = require('./domain');
const abstractdb = require("abstractdb");
const Database = abstractdb("better-sqlite3");
const RemoteProperty = require("./remoteproperty");

var DomainData = function () {
    this.domains = {}; 
    this.orderedDomains = [];
    this.db = new Database("app.db");
    this.db.sRun(`CREATE TABLE IF NOT EXISTS domains (
        name TEXT PRIMARY KEY,
        dns INTEGER NOT NULL,
        dnsLastCheck INTEGER NOT NULL,
        ping INTEGER NOT NULL,
        pingLastCheck INTEGER NOT NULL,
        http INTEGER NOT NULL,
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
        candidacies[this.addDomainCandidate(res[ii]["name"], false, res[ii])];
    }
    await Promise.all(candidacies);
}
DomainData.prototype.parseDomain = function (domain) {
    return domain.match(/^([^\s]+\.|)ed\.ac\.uk$/g);
}

DomainData.prototype.getXFromDomain = async function (x, domainName) {
    var domain = this.domains[domainName];
    if (domain == undefined) return { "state": 2 };
    await domain[x].update();
    var res = {};
    res[x] = {};
    res[x]["state"] = domain[x].value;
    res[x]["lastUpdate"] = domain[x].lastUpdate;
    return res;
}

DomainData.prototype.findOrderedIndex = function (domain, subsetLeft, subsetRight) {
    subsetLeft = subsetLeft !== undefined ? subsetLeft : 0;
    subsetRight = subsetRight !== undefined ? subsetRight : this.orderedDomains.length;
    while (subsetLeft !== subsetRight) {
        var checkDomain = this.orderedDomains[subsetLeft + Math.floor((subsetRight - subsetLeft) / 2)];
        if (checkDomain > domain) subsetRight = subsetLeft + Math.floor((subsetRight - subsetLeft) / 2);
        else subsetLeft = subsetRight - Math.floor((subsetRight - subsetLeft) / 2);
    }
    return subsetLeft;
}

DomainData.prototype.addDomainCandidate = async function (domain, isNew, data) {
    var parsedDomain = this.parseDomain(domain);
    if (parsedDomain === null) return { "state": 3 };
    if (this.domains[domain] !== undefined) return { "state": 1 };

    var candidate = new Domain(domain, this.db);
    if (isNew === false) candidate.setFromDb(data);
    else {
        await candidate.dns.update();
        if (candidate.dns.get() === RemoteProperty.DOES_NOT_EXIST) {
            candidate.delete();
            delete candidate;
            return {"state": 2};
        }
    }
    this.domains[domain] = candidate;
    this.orderedDomains.splice(this.findOrderedIndex(domain), 0, domain);
    return { "state": 0, "data": candidate.toJson() };
}

DomainData.prototype.getJson = function () {
    var res = [];
    for (var ii = 0; ii < this.orderedDomains.length; ii++) {
        var index = this.orderedDomains[ii];
        if (this.domains[index].initDone === false) continue;
        res.push(this.domains[index].toJson());
    }
    return res;
}
