const url = require("url");
const Domain = require('./domain');
const abstractdb = require("abstractdb");
const Database = abstractdb("better-sqlite3");
const RemoteProperty = require("./remoteproperty");
const dns = require("dns");
const util = require("util");

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
        httpLastUpdate INTEGER NOT NULL
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
DomainData.prototype.ipV4AddrSearch = new RegExp(/((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])/g);
DomainData.prototype.ipV6AddrSearch = new RegExp(/(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/g);
DomainData.prototype.extractDomains = async function (searchString) {
    searchString = " " + searchString + " ";
    var domainMatches = searchString.match(this.edAcUkSearch);
    for (var ii in domainMatches) domainMatches[ii] = domainMatches[ii].toLowerCase();
    if (domainMatches == undefined) domainMatches = [];

    var ipV4Matches = searchString.match(this.ipV4AddrSearch);
    if (ipV4Matches == undefined) ipV4Matches = [];
    var ipV6Matches = searchString.match(this.ipV6AddrSearch);
    if (ipV6Matches == undefined) ipV6Matches = [];

    var ipMatches = ipV4Matches.concat(ipV6Matches);
    var promisedReverse = util.promisify(dns.reverse);
    for (var ii in ipMatches) {
        try {
            var reverseResult = await promisedReverse(ipMatches[ii]);
        } catch (e) {
            continue;
        }
        domainMatches = domainMatches.concat(reverseResult);
    }

    return domainMatches;
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
    var names = await this.extractDomains(s);
    var candidates = [];
    for (var ii in names) candidates.push(this.addDomainCandidate(names[ii]));
    return await Promise.all(candidates);
}
DomainData.prototype.addDomainCandidate = async function (name, data) {
    if (this.domains[name] != undefined) return { "name": name, "state": 1 };

    var candidate = new Domain(name, this.db, this.addDomainCandidates.bind(this));
    if (data != undefined && typeof data === "object") candidate.setFromDb(data);
    else {
        await candidate.create();
        await candidate.dns.update();
        if (candidate.dns.state === RemoteProperty.DOES_NOT_EXIST) {
            candidate.delete();
            delete candidate;
            return { "name": name, "state": 2};
        }
        candidate.ping.update();
        candidate.http.update();
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
