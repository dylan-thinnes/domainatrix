/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const url = __webpack_require__(8);
const Domain = __webpack_require__(9);
const abstractdb = __webpack_require__(12);
const Database = abstractdb("better-sqlite3");
const RemoteProperty = __webpack_require__(4);
const dns = __webpack_require__(3);
const util = __webpack_require__(5);
const path = __webpack_require__(0);

var DomainData = function () {
    this.domains = {}; 
    this.orderedDomains = [];
    this.db = new Database(path.resolve("./app.db"));
    this.db.sRun(`CREATE TABLE IF NOT EXISTS domains (
        name TEXT PRIMARY KEY,
        dns STRING,
        dnsState INTEGER NOT NULL DEFAULT -2,
        dnsLastUpdate INTEGER NOT NULL DEFAULT 0,
        ping STRING,
        pingState INTEGER NOT NULL DEFAULT -2,
        pingLastUpdate INTEGER NOT NULL DEFAULT 0,
        http STRING,
        httpState INTEGER NOT NULL DEFAULT -2,
        httpLastUpdate INTEGER NOT NULL DEFAULT 0,
        children STRING,
        childrenState INTEGER NOT NULL DEFAULT -2,
        childrenLastUpdate INTEGER NOT NULL DEFAULT 0
    )`);
}
exports = module.exports = DomainData;

DomainData.prototype.init = async function () {
    var res = this.db.sAll("SELECT * FROM domains ORDER BY name ASC");
    var candidacies = [];
    for (var ii = 0; ii < res.length; ii++) {
        candidacies[this.addDomainCandidate(res[ii]["name"], res[ii])];
    }
    await Promise.all(candidacies);
    return;
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
    this.domains[name] = {}; //Prevent potential index allocation overlap due to asynchronicity

    var candidate = new Domain(name, this.db, this.addDomainCandidates.bind(this));
    if (data != undefined && typeof data === "object") candidate.setFromDb(data);
    else {
        await candidate.create();
        await candidate.dns.update();
        if (candidate.dns.state === RemoteProperty.DOES_NOT_EXIST) {
            candidate.delete();
            delete candidate;
            delete this.domains[name];
            return { "name": name, "state": 2};
        }
        candidate.ping.update();
        candidate.http.update();
        candidate.children.update();
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


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("dns");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

const util = __webpack_require__(5);

var RemoteProperty = function (onChangeCallback, remoteGetter) {
    this.onChangeCallback = onChangeCallback;
    this.remoteGetter = remoteGetter;
    this.state = RemoteProperty.NEVER_STARTED;
    this.value = undefined;
    this.lastUpdate = 0;
    this.waiters = [];
}
exports = module.exports = RemoteProperty;

RemoteProperty.NEVER_STARTED = -2;
RemoteProperty.IN_PROGRESS = -1;
RemoteProperty.DOES_EXIST = 0;
RemoteProperty.DOES_NOT_EXIST = 1;
/* State 0 is resolved positive position,
 * State 1 is resolved negative position,
 * State -1 is processing or undetermined state
 * State -2 is never processed / not yet initialized state
 */
RemoteProperty.UPDATE_THRESHOLD = process.argv.includes("-d") ? 0 : 3600;

// Override the base primitive value evaluation of this object
RemoteProperty.prototype.valueOf = function () {
    return this.state;
}

RemoteProperty.prototype.set = async function (newValue, noTriggerChangeCallback) {
    this.state = newValue != undefined ? RemoteProperty.DOES_EXIST : RemoteProperty.DOES_NOT_EXIST;
    if (util.isDeepStrictEqual(this.value, newValue)) return;
    this.value = newValue;
    if (noTriggerChangeCallback !== true) await this.onChangeCallback();
}
RemoteProperty.prototype.get = function () {
    return this.value;
}
RemoteProperty.prototype.update = async function () { // Returns boolean dependent on whether an actual update check was made.
    if (this.state === RemoteProperty.IN_PROGRESS) { // If an update in progress, wait for it to be over then return that value.
        await this.waitForUpdate();
        return true;
    }

    var currTime = Date.now();
    if (Date.now() < this.lastUpdate + RemoteProperty.UPDATE_THRESHOLD) return false; // Abort if last update was too recent.
    this.lastUpdate = currTime;

    this.state = RemoteProperty.IN_PROGRESS;
    var newValue = await new Promise(this.remoteGetter);
    if (newValue == undefined || newValue.length === 0) newValue = undefined;
    else {
        this.additionalData = newValue[1];
        newValue = newValue[0];
    }

    await this.set(newValue);
    while (this.waiters.length !== 0) (this.waiters.pop())(); // Run resolve for all other waiting update() calls
    return true;
}
RemoteProperty.prototype.waitForUpdate = function () {
    if (this.state !== RemoteProperty.IN_PROGRESS) return;
    return new Promise((function (resolve, reject) {
        this.waiters.push(resolve);
    }).bind(this));
}


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

const path = __webpack_require__(0);
const express = __webpack_require__(1);
const app = express();
const routes = __webpack_require__(7);
const bodyParser = __webpack_require__(13);
const compression = __webpack_require__(14);

// add compression support
app.use(compression());
// fallthrough to static files
console.log(path.join(__dirname, '../client'));
app.use(express.static(path.join(__dirname, '../client')));
// parse body parameters, use basic flat querystring
app.use(bodyParser.urlencoded({ extended: false }));

routes.makeRoutes().then(subapp => {
	app.use(subapp);

	app.get('*', (req, res) => {
		res.status = 404;
		res.send('');
	});

});

if (process.argv.includes("-d")) app.listen(8080);
exports = module.exports = app;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

const express = __webpack_require__(1);
const DomainData = __webpack_require__(2);

const makeRoutes = async function () {
	const app = express();

	const domData = new DomainData();
    await domData.init();

    app.put('/v1/domains/:name/dns', async (req, res, next) => {
        if (req.params.name == undefined) return next();
        var r = await domData.updateXFromDomain('dns', req.params.name);
        res.json(r);
    });
    app.put('/v1/domains/:name/ping', async (req, res, next) => {
        if (req.params.name == undefined) return next();
        var r = await domData.updateXFromDomain('ping', req.params.name);
        res.json(r);
    });
    app.put('/v1/domains/:name/http', async (req, res, next) => {
        if (req.params.name == undefined) return next();
        var r = await domData.updateXFromDomain('http', req.params.name);
        res.json(r);
    });
    app.put('/v1/domains/:name/children', async (req, res, next) => {
        if (req.params.name == undefined) return next();
        var r = await domData.updateXFromDomain('children', req.params.name);
        res.json(r);
    });
    app.get('/v1/domains/:name', async (req, res, next) => {
        if (req.params.name == undefined) return next();
        var r = domData.getJson(req.params.name);
        if (r == undefined) next();
        else res.json(r);
    });

    app.post('/v1/domains', async (req, res, next) => {
        if (req.body.names == undefined) return next();
        var r = await domData.addDomainCandidates(req.body.names);
        res.json(r);
    });
    app.get('/v1/domains', (req, res) => {
        res.json(domData.getJson());
    });

    return app;
}

exports = module.exports = { makeRoutes }


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

const dns = __webpack_require__(3);
const http = __webpack_require__(10);
const ping = __webpack_require__(11);
const RemoteProperty = __webpack_require__(4);
const DomainData = __webpack_require__(2);

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
    var candidateChildren = " ";
    await Promise.all([
        this.dns.waitForUpdate(),
        this.http.additionalData == undefined ? this.http.update() : this.http.waitForUpdate()
    ]);

    for (var rrtype in this.dns.value) {
        var records = this.dns.value[rrtype];
        for (var jj in records) {
            if (rrtype === "A" || rrtype === "AAAA" || rrtype === "CNAME" || rrtype === "PTR" || rrtype === "NS") candidateChildren += records[jj] + " ";
            else if (rrtype === "TXT") candidateChildren += records[jj].join(" ") + " ";
            else if (rrtype === "SRV") candidateChildren += records[jj].name + " ";
            else if (rrtype === "SOA") {
                candidateChildren += records[jj].nsname + " ";
                candidateChildren += records[jj].hostmaster + " ";
            }
            else if (rrtype === "NAPTR") candidateChildren += records[jj].replacement + " ";
            else if (rrtype === "MX") candidateChildren += records[jj].exchange + " ";
        }
    }
    if (this.http.additionalData != undefined) candidateChildren += this.http.additionalData + " ";

    var childrenStates = await this.addDomainCandidates(candidateChildren);
    var children = [];
    for (var ii in childrenStates) {
        var child = childrenStates[ii];
        if (child.state === 0 || child.state === 1) children.push(child.name);
    }
    resolve([children]);
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
        this.children.update();
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
    var onError = (function (res) {
        this.children.update();
        resolve([statusCode]);
    }).bind(this);
    var onResponse = (function (res) {
        statusCode = res.statusCode;
        this.children.update();
        resolve([statusCode, res.headers.location]);
    }).bind(this);
    var req = http.request({
        host: this.name,
        hostname: this.name,
        path: "/",
        port: 80,
        method: "HEAD"
    });
    setTimeout(() => {
        req.abort();
        resolve([statusCode]);
    }, 10000);
    req.on("error", onError); // Catches socket abortion error
    req.on("abort", onError);
    req.on("timeout", onError);
    req.on("response", onResponse);
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
        },
        children: {
            value: this.children.value,
            state: this.children.state,
            lastUpdate: this.children.lastUpdate
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
    this.children.state = data.childrenState;
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
    await this.db.aRun("INSERT INTO domains (name) VALUES ($name)", {
        $name: this.name
    });
}


/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("ping");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("abstractdb");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("compression");

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMDcwZTU4OTEwODY3YjIzNThlYWYiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicGF0aFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImV4cHJlc3NcIiIsIndlYnBhY2s6Ly8vLi9zZXJ2ZXIvZG9tYWluZGF0YS5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJkbnNcIiIsIndlYnBhY2s6Ly8vLi9zZXJ2ZXIvcmVtb3RlcHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwidXRpbFwiIiwid2VicGFjazovLy8uL3NlcnZlci9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zZXJ2ZXIvcm91dGVzLmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcInVybFwiIiwid2VicGFjazovLy8uL3NlcnZlci9kb21haW4uanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiaHR0cFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInBpbmdcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJhYnN0cmFjdGRiXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYm9keS1wYXJzZXJcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJjb21wcmVzc2lvblwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FB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QTtBQUNBLEVBQUU7O0FBRUYsQ0FBQzs7QUFFRDtBQUNBOzs7Ozs7O0FDMUJBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUEsNEJBQTRCOzs7Ozs7O0FDaEQ1QixnQzs7Ozs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4Qiw2QkFBNkI7QUFDM0QsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0VBQWtFLGlCQUFpQjtBQUNuRjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7Ozs7OztBQ3BMQSxpQzs7Ozs7O0FDQUEsaUM7Ozs7OztBQ0FBLHVDOzs7Ozs7QUNBQSx3Qzs7Ozs7O0FDQUEsd0MiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA2KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAwNzBlNTg5MTA4NjdiMjM1OGVhZiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJwYXRoXCJcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImV4cHJlc3NcIlxuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJjb25zdCB1cmwgPSByZXF1aXJlKFwidXJsXCIpO1xuY29uc3QgRG9tYWluID0gcmVxdWlyZSgnLi9kb21haW4nKTtcbmNvbnN0IGFic3RyYWN0ZGIgPSByZXF1aXJlKFwiYWJzdHJhY3RkYlwiKTtcbmNvbnN0IERhdGFiYXNlID0gYWJzdHJhY3RkYihcImJldHRlci1zcWxpdGUzXCIpO1xuY29uc3QgUmVtb3RlUHJvcGVydHkgPSByZXF1aXJlKFwiLi9yZW1vdGVwcm9wZXJ0eVwiKTtcbmNvbnN0IGRucyA9IHJlcXVpcmUoXCJkbnNcIik7XG5jb25zdCB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XG5jb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5cbnZhciBEb21haW5EYXRhID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZG9tYWlucyA9IHt9OyBcbiAgICB0aGlzLm9yZGVyZWREb21haW5zID0gW107XG4gICAgdGhpcy5kYiA9IG5ldyBEYXRhYmFzZShwYXRoLnJlc29sdmUoXCIuL2FwcC5kYlwiKSk7XG4gICAgdGhpcy5kYi5zUnVuKGBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBkb21haW5zIChcbiAgICAgICAgbmFtZSBURVhUIFBSSU1BUlkgS0VZLFxuICAgICAgICBkbnMgU1RSSU5HLFxuICAgICAgICBkbnNTdGF0ZSBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgLTIsXG4gICAgICAgIGRuc0xhc3RVcGRhdGUgSU5URUdFUiBOT1QgTlVMTCBERUZBVUxUIDAsXG4gICAgICAgIHBpbmcgU1RSSU5HLFxuICAgICAgICBwaW5nU3RhdGUgSU5URUdFUiBOT1QgTlVMTCBERUZBVUxUIC0yLFxuICAgICAgICBwaW5nTGFzdFVwZGF0ZSBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgMCxcbiAgICAgICAgaHR0cCBTVFJJTkcsXG4gICAgICAgIGh0dHBTdGF0ZSBJTlRFR0VSIE5PVCBOVUxMIERFRkFVTFQgLTIsXG4gICAgICAgIGh0dHBMYXN0VXBkYXRlIElOVEVHRVIgTk9UIE5VTEwgREVGQVVMVCAwLFxuICAgICAgICBjaGlsZHJlbiBTVFJJTkcsXG4gICAgICAgIGNoaWxkcmVuU3RhdGUgSU5URUdFUiBOT1QgTlVMTCBERUZBVUxUIC0yLFxuICAgICAgICBjaGlsZHJlbkxhc3RVcGRhdGUgSU5URUdFUiBOT1QgTlVMTCBERUZBVUxUIDBcbiAgICApYCk7XG59XG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBEb21haW5EYXRhO1xuXG5Eb21haW5EYXRhLnByb3RvdHlwZS5pbml0ID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXMgPSB0aGlzLmRiLnNBbGwoXCJTRUxFQ1QgKiBGUk9NIGRvbWFpbnMgT1JERVIgQlkgbmFtZSBBU0NcIik7XG4gICAgdmFyIGNhbmRpZGFjaWVzID0gW107XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IHJlcy5sZW5ndGg7IGlpKyspIHtcbiAgICAgICAgY2FuZGlkYWNpZXNbdGhpcy5hZGREb21haW5DYW5kaWRhdGUocmVzW2lpXVtcIm5hbWVcIl0sIHJlc1tpaV0pXTtcbiAgICB9XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoY2FuZGlkYWNpZXMpO1xuICAgIHJldHVybjtcbn1cblxuRG9tYWluRGF0YS5wcm90b3R5cGUuZWRBY1VrU2VhcmNoID0gbmV3IFJlZ0V4cCgvKD8hW15BLVphLXowLTlcXC1dKShbQS1aYS16MC05XFwtXFwuXStcXC58KWVkXFwuYWNcXC51ayg/PVteQS1aYS16MC05XFwtXSkvZyk7XG5Eb21haW5EYXRhLnByb3RvdHlwZS5pcFY0QWRkclNlYXJjaCA9IG5ldyBSZWdFeHAoLygoMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pXFwuKXszLDN9KDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKS9nKTtcbkRvbWFpbkRhdGEucHJvdG90eXBlLmlwVjZBZGRyU2VhcmNoID0gbmV3IFJlZ0V4cCgvKChbMC05YS1mQS1GXXsxLDR9Oil7Nyw3fVswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDd9OnwoWzAtOWEtZkEtRl17MSw0fTopezEsNn06WzAtOWEtZkEtRl17MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsNX0oOlswLTlhLWZBLUZdezEsNH0pezEsMn18KFswLTlhLWZBLUZdezEsNH06KXsxLDR9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDN9fChbMC05YS1mQS1GXXsxLDR9Oil7MSwzfSg6WzAtOWEtZkEtRl17MSw0fSl7MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsMn0oOlswLTlhLWZBLUZdezEsNH0pezEsNX18WzAtOWEtZkEtRl17MSw0fTooKDpbMC05YS1mQS1GXXsxLDR9KXsxLDZ9KXw6KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw3fXw6KXxmZTgwOig6WzAtOWEtZkEtRl17MCw0fSl7MCw0fSVbMC05YS16QS1aXXsxLH18OjooZmZmZig6MHsxLDR9KXswLDF9Oil7MCwxfSgoMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pXFwuKXszLDN9KDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKXwoWzAtOWEtZkEtRl17MSw0fTopezEsNH06KCgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSlcXC4pezMsM30oMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pKS9nKTtcbkRvbWFpbkRhdGEucHJvdG90eXBlLmV4dHJhY3REb21haW5zID0gYXN5bmMgZnVuY3Rpb24gKHNlYXJjaFN0cmluZykge1xuICAgIHNlYXJjaFN0cmluZyA9IFwiIFwiICsgc2VhcmNoU3RyaW5nICsgXCIgXCI7XG4gICAgdmFyIGRvbWFpbk1hdGNoZXMgPSBzZWFyY2hTdHJpbmcubWF0Y2godGhpcy5lZEFjVWtTZWFyY2gpO1xuICAgIGZvciAodmFyIGlpIGluIGRvbWFpbk1hdGNoZXMpIGRvbWFpbk1hdGNoZXNbaWldID0gZG9tYWluTWF0Y2hlc1tpaV0udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoZG9tYWluTWF0Y2hlcyA9PSB1bmRlZmluZWQpIGRvbWFpbk1hdGNoZXMgPSBbXTtcblxuICAgIHZhciBpcFY0TWF0Y2hlcyA9IHNlYXJjaFN0cmluZy5tYXRjaCh0aGlzLmlwVjRBZGRyU2VhcmNoKTtcbiAgICBpZiAoaXBWNE1hdGNoZXMgPT0gdW5kZWZpbmVkKSBpcFY0TWF0Y2hlcyA9IFtdO1xuICAgIHZhciBpcFY2TWF0Y2hlcyA9IHNlYXJjaFN0cmluZy5tYXRjaCh0aGlzLmlwVjZBZGRyU2VhcmNoKTtcbiAgICBpZiAoaXBWNk1hdGNoZXMgPT0gdW5kZWZpbmVkKSBpcFY2TWF0Y2hlcyA9IFtdO1xuXG4gICAgdmFyIGlwTWF0Y2hlcyA9IGlwVjRNYXRjaGVzLmNvbmNhdChpcFY2TWF0Y2hlcyk7XG4gICAgdmFyIHByb21pc2VkUmV2ZXJzZSA9IHV0aWwucHJvbWlzaWZ5KGRucy5yZXZlcnNlKTtcbiAgICBmb3IgKHZhciBpaSBpbiBpcE1hdGNoZXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciByZXZlcnNlUmVzdWx0ID0gYXdhaXQgcHJvbWlzZWRSZXZlcnNlKGlwTWF0Y2hlc1tpaV0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBkb21haW5NYXRjaGVzID0gZG9tYWluTWF0Y2hlcy5jb25jYXQocmV2ZXJzZVJlc3VsdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRvbWFpbk1hdGNoZXM7XG59XG5cbkRvbWFpbkRhdGEucHJvdG90eXBlLnVwZGF0ZVhGcm9tRG9tYWluID0gZnVuY3Rpb24gKHgsIGRvbWFpbk5hbWUpIHsgcmV0dXJuIHRoaXMuZ2V0WEZyb21Eb21haW4oeCwgZG9tYWluTmFtZSwgdHJ1ZSk7IH0gXG5Eb21haW5EYXRhLnByb3RvdHlwZS5nZXRYRnJvbURvbWFpbiA9IGFzeW5jIGZ1bmN0aW9uICh4LCBkb21haW5OYW1lLCB1cGRhdGUpIHtcbiAgICB2YXIgZG9tYWluID0gdGhpcy5kb21haW5zW2RvbWFpbk5hbWVdO1xuICAgIGlmIChkb21haW4gPT0gdW5kZWZpbmVkKSByZXR1cm4geyBcInN0YXRlXCI6IDIgfTtcbiAgICBpZiAodXBkYXRlID09PSB0cnVlKSBhd2FpdCBkb21haW5beF0udXBkYXRlKCk7XG4gICAgdmFyIHJlcyA9IHt9O1xuICAgIHJlc1t4XSA9IHt9O1xuICAgIHJlc1t4XVtcInZhbHVlXCJdID0gZG9tYWluW3hdLnZhbHVlO1xuICAgIHJlc1t4XVtcInN0YXRlXCJdID0gZG9tYWluW3hdLnN0YXRlO1xuICAgIHJlc1t4XVtcImxhc3RVcGRhdGVcIl0gPSBkb21haW5beF0ubGFzdFVwZGF0ZTtcbiAgICByZXR1cm4gcmVzO1xufVxuXG5Eb21haW5EYXRhLnByb3RvdHlwZS5maW5kT3JkZXJlZEluZGV4ID0gZnVuY3Rpb24gKGRvbWFpbiwgc3Vic2V0TGVmdCwgc3Vic2V0UmlnaHQpIHtcbiAgICBzdWJzZXRMZWZ0ID0gc3Vic2V0TGVmdCAhPSB1bmRlZmluZWQgPyBzdWJzZXRMZWZ0IDogMDtcbiAgICBzdWJzZXRSaWdodCA9IHN1YnNldFJpZ2h0ICE9IHVuZGVmaW5lZCA/IHN1YnNldFJpZ2h0IDogdGhpcy5vcmRlcmVkRG9tYWlucy5sZW5ndGg7XG4gICAgd2hpbGUgKHN1YnNldExlZnQgIT09IHN1YnNldFJpZ2h0KSB7XG4gICAgICAgIHZhciBjaGVja0RvbWFpbiA9IHRoaXMub3JkZXJlZERvbWFpbnNbc3Vic2V0TGVmdCArIE1hdGguZmxvb3IoKHN1YnNldFJpZ2h0IC0gc3Vic2V0TGVmdCkgLyAyKV07XG4gICAgICAgIGlmIChjaGVja0RvbWFpbiA+IGRvbWFpbikgc3Vic2V0UmlnaHQgPSBzdWJzZXRMZWZ0ICsgTWF0aC5mbG9vcigoc3Vic2V0UmlnaHQgLSBzdWJzZXRMZWZ0KSAvIDIpO1xuICAgICAgICBlbHNlIHN1YnNldExlZnQgPSBzdWJzZXRSaWdodCAtIE1hdGguZmxvb3IoKHN1YnNldFJpZ2h0IC0gc3Vic2V0TGVmdCkgLyAyKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1YnNldExlZnQ7XG59XG5cbkRvbWFpbkRhdGEucHJvdG90eXBlLmFkZERvbWFpbkNhbmRpZGF0ZXMgPSBhc3luYyBmdW5jdGlvbiAocykge1xuICAgIHZhciBuYW1lcyA9IGF3YWl0IHRoaXMuZXh0cmFjdERvbWFpbnMocyk7XG4gICAgdmFyIGNhbmRpZGF0ZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpaSBpbiBuYW1lcykgY2FuZGlkYXRlcy5wdXNoKHRoaXMuYWRkRG9tYWluQ2FuZGlkYXRlKG5hbWVzW2lpXSkpO1xuICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChjYW5kaWRhdGVzKTtcbn1cbkRvbWFpbkRhdGEucHJvdG90eXBlLmFkZERvbWFpbkNhbmRpZGF0ZSA9IGFzeW5jIGZ1bmN0aW9uIChuYW1lLCBkYXRhKSB7XG4gICAgaWYgKHRoaXMuZG9tYWluc1tuYW1lXSAhPSB1bmRlZmluZWQpIHJldHVybiB7IFwibmFtZVwiOiBuYW1lLCBcInN0YXRlXCI6IDEgfTtcbiAgICB0aGlzLmRvbWFpbnNbbmFtZV0gPSB7fTsgLy9QcmV2ZW50IHBvdGVudGlhbCBpbmRleCBhbGxvY2F0aW9uIG92ZXJsYXAgZHVlIHRvIGFzeW5jaHJvbmljaXR5XG5cbiAgICB2YXIgY2FuZGlkYXRlID0gbmV3IERvbWFpbihuYW1lLCB0aGlzLmRiLCB0aGlzLmFkZERvbWFpbkNhbmRpZGF0ZXMuYmluZCh0aGlzKSk7XG4gICAgaWYgKGRhdGEgIT0gdW5kZWZpbmVkICYmIHR5cGVvZiBkYXRhID09PSBcIm9iamVjdFwiKSBjYW5kaWRhdGUuc2V0RnJvbURiKGRhdGEpO1xuICAgIGVsc2Uge1xuICAgICAgICBhd2FpdCBjYW5kaWRhdGUuY3JlYXRlKCk7XG4gICAgICAgIGF3YWl0IGNhbmRpZGF0ZS5kbnMudXBkYXRlKCk7XG4gICAgICAgIGlmIChjYW5kaWRhdGUuZG5zLnN0YXRlID09PSBSZW1vdGVQcm9wZXJ0eS5ET0VTX05PVF9FWElTVCkge1xuICAgICAgICAgICAgY2FuZGlkYXRlLmRlbGV0ZSgpO1xuICAgICAgICAgICAgZGVsZXRlIGNhbmRpZGF0ZTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmRvbWFpbnNbbmFtZV07XG4gICAgICAgICAgICByZXR1cm4geyBcIm5hbWVcIjogbmFtZSwgXCJzdGF0ZVwiOiAyfTtcbiAgICAgICAgfVxuICAgICAgICBjYW5kaWRhdGUucGluZy51cGRhdGUoKTtcbiAgICAgICAgY2FuZGlkYXRlLmh0dHAudXBkYXRlKCk7XG4gICAgICAgIGNhbmRpZGF0ZS5jaGlsZHJlbi51cGRhdGUoKTtcbiAgICB9XG4gICAgdGhpcy5kb21haW5zW25hbWVdID0gY2FuZGlkYXRlO1xuICAgIHRoaXMub3JkZXJlZERvbWFpbnMuc3BsaWNlKHRoaXMuZmluZE9yZGVyZWRJbmRleChuYW1lKSwgMCwgbmFtZSk7XG4gICAgcmV0dXJuIHsgXCJuYW1lXCI6IG5hbWUsIFwic3RhdGVcIjogMCwgXCJkYXRhXCI6IGNhbmRpZGF0ZS50b0pzb24oKSB9O1xufVxuXG5Eb21haW5EYXRhLnByb3RvdHlwZS5nZXRKc29uID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHRoaXMuZG9tYWluc1tuYW1lXSA9PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgcmV0dXJuIHRoaXMuZG9tYWluc1tuYW1lXS50b0pzb24oKTtcbiAgICB9XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCB0aGlzLm9yZGVyZWREb21haW5zLmxlbmd0aDsgaWkrKykge1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLm9yZGVyZWREb21haW5zW2lpXTtcbiAgICAgICAgaWYgKHRoaXMuZG9tYWluc1tpbmRleF0uaW5pdERvbmUgPT09IGZhbHNlKSBjb250aW51ZTtcbiAgICAgICAgcmVzLnB1c2godGhpcy5kb21haW5zW2luZGV4XS50b0pzb24oKSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NlcnZlci9kb21haW5kYXRhLmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImRuc1wiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImRuc1wiXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImNvbnN0IHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcblxudmFyIFJlbW90ZVByb3BlcnR5ID0gZnVuY3Rpb24gKG9uQ2hhbmdlQ2FsbGJhY2ssIHJlbW90ZUdldHRlcikge1xuICAgIHRoaXMub25DaGFuZ2VDYWxsYmFjayA9IG9uQ2hhbmdlQ2FsbGJhY2s7XG4gICAgdGhpcy5yZW1vdGVHZXR0ZXIgPSByZW1vdGVHZXR0ZXI7XG4gICAgdGhpcy5zdGF0ZSA9IFJlbW90ZVByb3BlcnR5Lk5FVkVSX1NUQVJURUQ7XG4gICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmxhc3RVcGRhdGUgPSAwO1xuICAgIHRoaXMud2FpdGVycyA9IFtdO1xufVxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gUmVtb3RlUHJvcGVydHk7XG5cblJlbW90ZVByb3BlcnR5Lk5FVkVSX1NUQVJURUQgPSAtMjtcblJlbW90ZVByb3BlcnR5LklOX1BST0dSRVNTID0gLTE7XG5SZW1vdGVQcm9wZXJ0eS5ET0VTX0VYSVNUID0gMDtcblJlbW90ZVByb3BlcnR5LkRPRVNfTk9UX0VYSVNUID0gMTtcbi8qIFN0YXRlIDAgaXMgcmVzb2x2ZWQgcG9zaXRpdmUgcG9zaXRpb24sXG4gKiBTdGF0ZSAxIGlzIHJlc29sdmVkIG5lZ2F0aXZlIHBvc2l0aW9uLFxuICogU3RhdGUgLTEgaXMgcHJvY2Vzc2luZyBvciB1bmRldGVybWluZWQgc3RhdGVcbiAqIFN0YXRlIC0yIGlzIG5ldmVyIHByb2Nlc3NlZCAvIG5vdCB5ZXQgaW5pdGlhbGl6ZWQgc3RhdGVcbiAqL1xuUmVtb3RlUHJvcGVydHkuVVBEQVRFX1RIUkVTSE9MRCA9IHByb2Nlc3MuYXJndi5pbmNsdWRlcyhcIi1kXCIpID8gMCA6IDM2MDA7XG5cbi8vIE92ZXJyaWRlIHRoZSBiYXNlIHByaW1pdGl2ZSB2YWx1ZSBldmFsdWF0aW9uIG9mIHRoaXMgb2JqZWN0XG5SZW1vdGVQcm9wZXJ0eS5wcm90b3R5cGUudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZTtcbn1cblxuUmVtb3RlUHJvcGVydHkucHJvdG90eXBlLnNldCA9IGFzeW5jIGZ1bmN0aW9uIChuZXdWYWx1ZSwgbm9UcmlnZ2VyQ2hhbmdlQ2FsbGJhY2spIHtcbiAgICB0aGlzLnN0YXRlID0gbmV3VmFsdWUgIT0gdW5kZWZpbmVkID8gUmVtb3RlUHJvcGVydHkuRE9FU19FWElTVCA6IFJlbW90ZVByb3BlcnR5LkRPRVNfTk9UX0VYSVNUO1xuICAgIGlmICh1dGlsLmlzRGVlcFN0cmljdEVxdWFsKHRoaXMudmFsdWUsIG5ld1ZhbHVlKSkgcmV0dXJuO1xuICAgIHRoaXMudmFsdWUgPSBuZXdWYWx1ZTtcbiAgICBpZiAobm9UcmlnZ2VyQ2hhbmdlQ2FsbGJhY2sgIT09IHRydWUpIGF3YWl0IHRoaXMub25DaGFuZ2VDYWxsYmFjaygpO1xufVxuUmVtb3RlUHJvcGVydHkucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbn1cblJlbW90ZVByb3BlcnR5LnByb3RvdHlwZS51cGRhdGUgPSBhc3luYyBmdW5jdGlvbiAoKSB7IC8vIFJldHVybnMgYm9vbGVhbiBkZXBlbmRlbnQgb24gd2hldGhlciBhbiBhY3R1YWwgdXBkYXRlIGNoZWNrIHdhcyBtYWRlLlxuICAgIGlmICh0aGlzLnN0YXRlID09PSBSZW1vdGVQcm9wZXJ0eS5JTl9QUk9HUkVTUykgeyAvLyBJZiBhbiB1cGRhdGUgaW4gcHJvZ3Jlc3MsIHdhaXQgZm9yIGl0IHRvIGJlIG92ZXIgdGhlbiByZXR1cm4gdGhhdCB2YWx1ZS5cbiAgICAgICAgYXdhaXQgdGhpcy53YWl0Rm9yVXBkYXRlKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHZhciBjdXJyVGltZSA9IERhdGUubm93KCk7XG4gICAgaWYgKERhdGUubm93KCkgPCB0aGlzLmxhc3RVcGRhdGUgKyBSZW1vdGVQcm9wZXJ0eS5VUERBVEVfVEhSRVNIT0xEKSByZXR1cm4gZmFsc2U7IC8vIEFib3J0IGlmIGxhc3QgdXBkYXRlIHdhcyB0b28gcmVjZW50LlxuICAgIHRoaXMubGFzdFVwZGF0ZSA9IGN1cnJUaW1lO1xuXG4gICAgdGhpcy5zdGF0ZSA9IFJlbW90ZVByb3BlcnR5LklOX1BST0dSRVNTO1xuICAgIHZhciBuZXdWYWx1ZSA9IGF3YWl0IG5ldyBQcm9taXNlKHRoaXMucmVtb3RlR2V0dGVyKTtcbiAgICBpZiAobmV3VmFsdWUgPT0gdW5kZWZpbmVkIHx8IG5ld1ZhbHVlLmxlbmd0aCA9PT0gMCkgbmV3VmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuYWRkaXRpb25hbERhdGEgPSBuZXdWYWx1ZVsxXTtcbiAgICAgICAgbmV3VmFsdWUgPSBuZXdWYWx1ZVswXTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnNldChuZXdWYWx1ZSk7XG4gICAgd2hpbGUgKHRoaXMud2FpdGVycy5sZW5ndGggIT09IDApICh0aGlzLndhaXRlcnMucG9wKCkpKCk7IC8vIFJ1biByZXNvbHZlIGZvciBhbGwgb3RoZXIgd2FpdGluZyB1cGRhdGUoKSBjYWxsc1xuICAgIHJldHVybiB0cnVlO1xufVxuUmVtb3RlUHJvcGVydHkucHJvdG90eXBlLndhaXRGb3JVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUgIT09IFJlbW90ZVByb3BlcnR5LklOX1BST0dSRVNTKSByZXR1cm47XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHRoaXMud2FpdGVycy5wdXNoKHJlc29sdmUpO1xuICAgIH0pLmJpbmQodGhpcykpO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zZXJ2ZXIvcmVtb3RlcHJvcGVydHkuanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXRpbFwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInV0aWxcIlxuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJjb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5jb25zdCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xuY29uc3QgYXBwID0gZXhwcmVzcygpO1xuY29uc3Qgcm91dGVzID0gcmVxdWlyZSgnLi9yb3V0ZXMuanMnKTtcbmNvbnN0IGJvZHlQYXJzZXIgPSByZXF1aXJlKCdib2R5LXBhcnNlcicpO1xuY29uc3QgY29tcHJlc3Npb24gPSByZXF1aXJlKCdjb21wcmVzc2lvbicpO1xuXG4vLyBhZGQgY29tcHJlc3Npb24gc3VwcG9ydFxuYXBwLnVzZShjb21wcmVzc2lvbigpKTtcbi8vIGZhbGx0aHJvdWdoIHRvIHN0YXRpYyBmaWxlc1xuY29uc29sZS5sb2cocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2NsaWVudCcpKTtcbmFwcC51c2UoZXhwcmVzcy5zdGF0aWMocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2NsaWVudCcpKSk7XG4vLyBwYXJzZSBib2R5IHBhcmFtZXRlcnMsIHVzZSBiYXNpYyBmbGF0IHF1ZXJ5c3RyaW5nXG5hcHAudXNlKGJvZHlQYXJzZXIudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiBmYWxzZSB9KSk7XG5cbnJvdXRlcy5tYWtlUm91dGVzKCkudGhlbihzdWJhcHAgPT4ge1xuXHRhcHAudXNlKHN1YmFwcCk7XG5cblx0YXBwLmdldCgnKicsIChyZXEsIHJlcykgPT4ge1xuXHRcdHJlcy5zdGF0dXMgPSA0MDQ7XG5cdFx0cmVzLnNlbmQoJycpO1xuXHR9KTtcblxufSk7XG5cbmlmIChwcm9jZXNzLmFyZ3YuaW5jbHVkZXMoXCItZFwiKSkgYXBwLmxpc3Rlbig4MDgwKTtcbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGFwcDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc2VydmVyL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImNvbnN0IGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG5jb25zdCBEb21haW5EYXRhID0gcmVxdWlyZSgnLi9kb21haW5kYXRhJyk7XG5cbmNvbnN0IG1ha2VSb3V0ZXMgPSBhc3luYyBmdW5jdGlvbiAoKSB7XG5cdGNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcblxuXHRjb25zdCBkb21EYXRhID0gbmV3IERvbWFpbkRhdGEoKTtcbiAgICBhd2FpdCBkb21EYXRhLmluaXQoKTtcblxuICAgIGFwcC5wdXQoJy92MS9kb21haW5zLzpuYW1lL2RucycsIGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBpZiAocmVxLnBhcmFtcy5uYW1lID09IHVuZGVmaW5lZCkgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgdmFyIHIgPSBhd2FpdCBkb21EYXRhLnVwZGF0ZVhGcm9tRG9tYWluKCdkbnMnLCByZXEucGFyYW1zLm5hbWUpO1xuICAgICAgICByZXMuanNvbihyKTtcbiAgICB9KTtcbiAgICBhcHAucHV0KCcvdjEvZG9tYWlucy86bmFtZS9waW5nJywgYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGlmIChyZXEucGFyYW1zLm5hbWUgPT0gdW5kZWZpbmVkKSByZXR1cm4gbmV4dCgpO1xuICAgICAgICB2YXIgciA9IGF3YWl0IGRvbURhdGEudXBkYXRlWEZyb21Eb21haW4oJ3BpbmcnLCByZXEucGFyYW1zLm5hbWUpO1xuICAgICAgICByZXMuanNvbihyKTtcbiAgICB9KTtcbiAgICBhcHAucHV0KCcvdjEvZG9tYWlucy86bmFtZS9odHRwJywgYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGlmIChyZXEucGFyYW1zLm5hbWUgPT0gdW5kZWZpbmVkKSByZXR1cm4gbmV4dCgpO1xuICAgICAgICB2YXIgciA9IGF3YWl0IGRvbURhdGEudXBkYXRlWEZyb21Eb21haW4oJ2h0dHAnLCByZXEucGFyYW1zLm5hbWUpO1xuICAgICAgICByZXMuanNvbihyKTtcbiAgICB9KTtcbiAgICBhcHAucHV0KCcvdjEvZG9tYWlucy86bmFtZS9jaGlsZHJlbicsIGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBpZiAocmVxLnBhcmFtcy5uYW1lID09IHVuZGVmaW5lZCkgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgdmFyIHIgPSBhd2FpdCBkb21EYXRhLnVwZGF0ZVhGcm9tRG9tYWluKCdjaGlsZHJlbicsIHJlcS5wYXJhbXMubmFtZSk7XG4gICAgICAgIHJlcy5qc29uKHIpO1xuICAgIH0pO1xuICAgIGFwcC5nZXQoJy92MS9kb21haW5zLzpuYW1lJywgYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGlmIChyZXEucGFyYW1zLm5hbWUgPT0gdW5kZWZpbmVkKSByZXR1cm4gbmV4dCgpO1xuICAgICAgICB2YXIgciA9IGRvbURhdGEuZ2V0SnNvbihyZXEucGFyYW1zLm5hbWUpO1xuICAgICAgICBpZiAociA9PSB1bmRlZmluZWQpIG5leHQoKTtcbiAgICAgICAgZWxzZSByZXMuanNvbihyKTtcbiAgICB9KTtcblxuICAgIGFwcC5wb3N0KCcvdjEvZG9tYWlucycsIGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBpZiAocmVxLmJvZHkubmFtZXMgPT0gdW5kZWZpbmVkKSByZXR1cm4gbmV4dCgpO1xuICAgICAgICB2YXIgciA9IGF3YWl0IGRvbURhdGEuYWRkRG9tYWluQ2FuZGlkYXRlcyhyZXEuYm9keS5uYW1lcyk7XG4gICAgICAgIHJlcy5qc29uKHIpO1xuICAgIH0pO1xuICAgIGFwcC5nZXQoJy92MS9kb21haW5zJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHJlcy5qc29uKGRvbURhdGEuZ2V0SnNvbigpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBhcHA7XG59XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHsgbWFrZVJvdXRlcyB9XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NlcnZlci9yb3V0ZXMuanNcbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXJsXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwidXJsXCJcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiY29uc3QgZG5zID0gcmVxdWlyZSgnZG5zJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnaHR0cCcpO1xuY29uc3QgcGluZyA9IHJlcXVpcmUoJ3BpbmcnKTtcbmNvbnN0IFJlbW90ZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9yZW1vdGVwcm9wZXJ0eScpO1xuY29uc3QgRG9tYWluRGF0YSA9IHJlcXVpcmUoJy4vZG9tYWluZGF0YScpO1xuXG52YXIgRG9tYWluID0gZnVuY3Rpb24gKG5hbWUsIGRiLCBhZGREb21haW5DYW5kaWRhdGVzKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmRiID0gZGI7XG4gICAgdGhpcy5kbnMgPSAgbmV3IFJlbW90ZVByb3BlcnR5KHRoaXMud3JpdGVTdGF0ZS5iaW5kKHRoaXMsIFwiZG5zXCIpLCAgdGhpcy5nZXRSZW1vdGVEbnMuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5waW5nID0gbmV3IFJlbW90ZVByb3BlcnR5KHRoaXMud3JpdGVTdGF0ZS5iaW5kKHRoaXMsIFwicGluZ1wiKSwgdGhpcy5nZXRSZW1vdGVQaW5nLmJpbmQodGhpcykpO1xuICAgIHRoaXMuaHR0cCA9IG5ldyBSZW1vdGVQcm9wZXJ0eSh0aGlzLndyaXRlU3RhdGUuYmluZCh0aGlzLCBcImh0dHBcIiksIHRoaXMuZ2V0UmVtb3RlSHR0cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmNoaWxkcmVuID0gbmV3IFJlbW90ZVByb3BlcnR5KHRoaXMud3JpdGVTdGF0ZS5iaW5kKHRoaXMsIFwiY2hpbGRyZW5cIiksIHRoaXMuZ2V0UmVtb3RlQ2hpbGRyZW4uYmluZCh0aGlzKSk7XG4gICAgdGhpcy5hZGREb21haW5DYW5kaWRhdGVzID0gYWRkRG9tYWluQ2FuZGlkYXRlcztcbiAgICB0aGlzLmNoaWxkQ2FuZGlkYXRlcyA9IFtdO1xufVxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gRG9tYWluO1xuXG5Eb21haW4ucHJvdG90eXBlLmdldFJlbW90ZUNoaWxkcmVuID0gYXN5bmMgZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciBjYW5kaWRhdGVDaGlsZHJlbiA9IFwiIFwiO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgdGhpcy5kbnMud2FpdEZvclVwZGF0ZSgpLFxuICAgICAgICB0aGlzLmh0dHAuYWRkaXRpb25hbERhdGEgPT0gdW5kZWZpbmVkID8gdGhpcy5odHRwLnVwZGF0ZSgpIDogdGhpcy5odHRwLndhaXRGb3JVcGRhdGUoKVxuICAgIF0pO1xuXG4gICAgZm9yICh2YXIgcnJ0eXBlIGluIHRoaXMuZG5zLnZhbHVlKSB7XG4gICAgICAgIHZhciByZWNvcmRzID0gdGhpcy5kbnMudmFsdWVbcnJ0eXBlXTtcbiAgICAgICAgZm9yICh2YXIgamogaW4gcmVjb3Jkcykge1xuICAgICAgICAgICAgaWYgKHJydHlwZSA9PT0gXCJBXCIgfHwgcnJ0eXBlID09PSBcIkFBQUFcIiB8fCBycnR5cGUgPT09IFwiQ05BTUVcIiB8fCBycnR5cGUgPT09IFwiUFRSXCIgfHwgcnJ0eXBlID09PSBcIk5TXCIpIGNhbmRpZGF0ZUNoaWxkcmVuICs9IHJlY29yZHNbampdICsgXCIgXCI7XG4gICAgICAgICAgICBlbHNlIGlmIChycnR5cGUgPT09IFwiVFhUXCIpIGNhbmRpZGF0ZUNoaWxkcmVuICs9IHJlY29yZHNbampdLmpvaW4oXCIgXCIpICsgXCIgXCI7XG4gICAgICAgICAgICBlbHNlIGlmIChycnR5cGUgPT09IFwiU1JWXCIpIGNhbmRpZGF0ZUNoaWxkcmVuICs9IHJlY29yZHNbampdLm5hbWUgKyBcIiBcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKHJydHlwZSA9PT0gXCJTT0FcIikge1xuICAgICAgICAgICAgICAgIGNhbmRpZGF0ZUNoaWxkcmVuICs9IHJlY29yZHNbampdLm5zbmFtZSArIFwiIFwiO1xuICAgICAgICAgICAgICAgIGNhbmRpZGF0ZUNoaWxkcmVuICs9IHJlY29yZHNbampdLmhvc3RtYXN0ZXIgKyBcIiBcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHJydHlwZSA9PT0gXCJOQVBUUlwiKSBjYW5kaWRhdGVDaGlsZHJlbiArPSByZWNvcmRzW2pqXS5yZXBsYWNlbWVudCArIFwiIFwiO1xuICAgICAgICAgICAgZWxzZSBpZiAocnJ0eXBlID09PSBcIk1YXCIpIGNhbmRpZGF0ZUNoaWxkcmVuICs9IHJlY29yZHNbampdLmV4Y2hhbmdlICsgXCIgXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuaHR0cC5hZGRpdGlvbmFsRGF0YSAhPSB1bmRlZmluZWQpIGNhbmRpZGF0ZUNoaWxkcmVuICs9IHRoaXMuaHR0cC5hZGRpdGlvbmFsRGF0YSArIFwiIFwiO1xuXG4gICAgdmFyIGNoaWxkcmVuU3RhdGVzID0gYXdhaXQgdGhpcy5hZGREb21haW5DYW5kaWRhdGVzKGNhbmRpZGF0ZUNoaWxkcmVuKTtcbiAgICB2YXIgY2hpbGRyZW4gPSBbXTtcbiAgICBmb3IgKHZhciBpaSBpbiBjaGlsZHJlblN0YXRlcykge1xuICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlblN0YXRlc1tpaV07XG4gICAgICAgIGlmIChjaGlsZC5zdGF0ZSA9PT0gMCB8fCBjaGlsZC5zdGF0ZSA9PT0gMSkgY2hpbGRyZW4ucHVzaChjaGlsZC5uYW1lKTtcbiAgICB9XG4gICAgcmVzb2x2ZShbY2hpbGRyZW5dKTtcbn1cbkRvbWFpbi5wcm90b3R5cGUuZ2V0UmVtb3RlRG5zID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciBuYW1lID0gdGhpcy5uYW1lO1xuICAgIHZhciBwcm9taXNlZERuc1Jlc29sdmUgPSBmdW5jdGlvbiAocnJ0eXBlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBkbnMucmVzb2x2ZShuYW1lLCBycnR5cGUsIChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIgIT0gdW5kZWZpbmVkKSByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgZWxzZSByZXNvbHZlKHsgdHlwZTogcnJ0eXBlLCByZWNvcmRzOiByZXMgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgcHJvbWlzZWREbnNSZXNvbHZlKFwiQVwiKSxcbiAgICAgICAgcHJvbWlzZWREbnNSZXNvbHZlKFwiQUFBQVwiKSxcbiAgICAgICAgcHJvbWlzZWREbnNSZXNvbHZlKFwiQ05BTUVcIiksXG4gICAgICAgIHByb21pc2VkRG5zUmVzb2x2ZShcIk1YXCIpLFxuICAgICAgICBwcm9taXNlZERuc1Jlc29sdmUoXCJOU1wiKSxcbiAgICAgICAgcHJvbWlzZWREbnNSZXNvbHZlKFwiU09BXCIpLFxuICAgICAgICBwcm9taXNlZERuc1Jlc29sdmUoXCJTUlZcIiksXG4gICAgICAgIHByb21pc2VkRG5zUmVzb2x2ZShcIlRYVFwiKSxcbiAgICAgICAgcHJvbWlzZWREbnNSZXNvbHZlKFwiTkFQVFJcIiksXG4gICAgICAgIHByb21pc2VkRG5zUmVzb2x2ZShcIlBUUlwiKVxuICAgIF0pLnRoZW4oKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgIHZhciByZXN1bHRFeGlzdHMgPSBmYWxzZTtcbiAgICAgICAgdmFyIGZpbmFsUmVzdWx0cyA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpaSBpbiByZXN1bHRzKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0c1tpaV0gPT0gdW5kZWZpbmVkIHx8IHJlc3VsdHNbaWldLnJlY29yZHMubGVuZ3RoID09PSAwKSBjb250aW51ZTtcbiAgICAgICAgICAgIGZpbmFsUmVzdWx0c1tyZXN1bHRzW2lpXS50eXBlXSA9IHJlc3VsdHNbaWldLnJlY29yZHM7XG4gICAgICAgICAgICByZXN1bHRFeGlzdHMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hpbGRyZW4udXBkYXRlKCk7XG4gICAgICAgIGlmIChyZXN1bHRFeGlzdHMpIHJlc29sdmUoW2ZpbmFsUmVzdWx0c10pO1xuICAgICAgICBlbHNlIHJlc29sdmUoKTtcbiAgICB9KS5iaW5kKHRoaXMpKTtcbn1cbkRvbWFpbi5wcm90b3R5cGUuZ2V0UmVtb3RlUGluZyA9IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICBwaW5nLnByb21pc2UucHJvYmUodGhpcy5uYW1lLCB7XG4gICAgICAgIGV4dHJhOiBbXCItY1wiLCBcIjQwXCJdIC8vIFN5c3RlbSBzcGVjaWZpYyBvcHRpb25zIHRvIG1ha2UgdGhlIHBpbmcgY2hlY2sgbWFrZSA0MCByZXF1ZXN0cy5cbiAgICB9KS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgaWYgKCFyZXMuYWxpdmUpIHJlc29sdmUoKTtcbiAgICAgICAgdmFyIGxhdGVuY3kgPSBNYXRoLmZsb29yKHBhcnNlRmxvYXQocmVzLmF2ZykgKiAxMDAwKTtcbiAgICAgICAgcmVzb2x2ZShbbGF0ZW5jeV0pO1xuICAgIH0pO1xufVxuRG9tYWluLnByb3RvdHlwZS5nZXRSZW1vdGVIdHRwID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciBzdGF0dXNDb2RlO1xuICAgIHZhciBvbkVycm9yID0gKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbi51cGRhdGUoKTtcbiAgICAgICAgcmVzb2x2ZShbc3RhdHVzQ29kZV0pO1xuICAgIH0pLmJpbmQodGhpcyk7XG4gICAgdmFyIG9uUmVzcG9uc2UgPSAoZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBzdGF0dXNDb2RlID0gcmVzLnN0YXR1c0NvZGU7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4udXBkYXRlKCk7XG4gICAgICAgIHJlc29sdmUoW3N0YXR1c0NvZGUsIHJlcy5oZWFkZXJzLmxvY2F0aW9uXSk7XG4gICAgfSkuYmluZCh0aGlzKTtcbiAgICB2YXIgcmVxID0gaHR0cC5yZXF1ZXN0KHtcbiAgICAgICAgaG9zdDogdGhpcy5uYW1lLFxuICAgICAgICBob3N0bmFtZTogdGhpcy5uYW1lLFxuICAgICAgICBwYXRoOiBcIi9cIixcbiAgICAgICAgcG9ydDogODAsXG4gICAgICAgIG1ldGhvZDogXCJIRUFEXCJcbiAgICB9KTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVxLmFib3J0KCk7XG4gICAgICAgIHJlc29sdmUoW3N0YXR1c0NvZGVdKTtcbiAgICB9LCAxMDAwMCk7XG4gICAgcmVxLm9uKFwiZXJyb3JcIiwgb25FcnJvcik7IC8vIENhdGNoZXMgc29ja2V0IGFib3J0aW9uIGVycm9yXG4gICAgcmVxLm9uKFwiYWJvcnRcIiwgb25FcnJvcik7XG4gICAgcmVxLm9uKFwidGltZW91dFwiLCBvbkVycm9yKTtcbiAgICByZXEub24oXCJyZXNwb25zZVwiLCBvblJlc3BvbnNlKTtcbiAgICByZXEuZW5kKCk7XG59XG5cbkRvbWFpbi5wcm90b3R5cGUudG9Kc29uID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgZG5zOiB7XG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5kbnMudmFsdWUsXG4gICAgICAgICAgICBzdGF0ZTogdGhpcy5kbnMuc3RhdGUsXG4gICAgICAgICAgICBsYXN0VXBkYXRlOiB0aGlzLmRucy5sYXN0VXBkYXRlXG4gICAgICAgIH0sXG4gICAgICAgIHBpbmc6IHtcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnBpbmcudmFsdWUsXG4gICAgICAgICAgICBzdGF0ZTogdGhpcy5waW5nLnN0YXRlLFxuICAgICAgICAgICAgbGFzdFVwZGF0ZTogdGhpcy5waW5nLmxhc3RVcGRhdGVcbiAgICAgICAgfSxcbiAgICAgICAgaHR0cDoge1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMuaHR0cC52YWx1ZSxcbiAgICAgICAgICAgIHN0YXRlOiB0aGlzLmh0dHAuc3RhdGUsXG4gICAgICAgICAgICBsYXN0VXBkYXRlOiB0aGlzLmh0dHAubGFzdFVwZGF0ZVxuICAgICAgICB9LFxuICAgICAgICBjaGlsZHJlbjoge1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMuY2hpbGRyZW4udmFsdWUsXG4gICAgICAgICAgICBzdGF0ZTogdGhpcy5jaGlsZHJlbi5zdGF0ZSxcbiAgICAgICAgICAgIGxhc3RVcGRhdGU6IHRoaXMuY2hpbGRyZW4ubGFzdFVwZGF0ZVxuICAgICAgICB9XG4gICAgfVxufVxuRG9tYWluLnByb3RvdHlwZS50b0RiID0gZnVuY3Rpb24gKHByb3BlcnR5TmFtZSkge1xuICAgIHZhciBwYXJhbXMgPSB7ICRuYW1lOiB0aGlzLm5hbWUgfVxuICAgIHBhcmFtc1tcIiRwcm9wXCJdID0gKHByb3BlcnR5TmFtZSA9PT0gXCJkbnNcIiB8fCBwcm9wZXJ0eU5hbWUgPT09IFwiY2hpbGRyZW5cIikgPyBKU09OLnN0cmluZ2lmeSh0aGlzW3Byb3BlcnR5TmFtZV0udmFsdWUpIDogdGhpc1twcm9wZXJ0eU5hbWVdLnZhbHVlO1xuICAgIHBhcmFtc1tcIiRwcm9wU3RhdGVcIl0gPSB0aGlzW3Byb3BlcnR5TmFtZV0uc3RhdGU7XG4gICAgcGFyYW1zW1wiJHByb3BMYXN0VXBkYXRlXCJdID0gdGhpc1twcm9wZXJ0eU5hbWVdLmxhc3RVcGRhdGU7XG4gICAgcmV0dXJuIHBhcmFtcztcbn1cblxuRG9tYWluLnByb3RvdHlwZS5zZXRGcm9tRGIgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHRoaXMuZG5zLnZhbHVlID0gSlNPTi5wYXJzZShkYXRhLmRucyk7XG4gICAgdGhpcy5kbnMuc3RhdGUgPSBkYXRhLmRuc1N0YXRlO1xuICAgIHRoaXMuZG5zLmxhc3RVcGRhdGUgPSBkYXRhLmRuc0xhc3RVcGRhdGU7XG4gICAgdGhpcy5waW5nLnZhbHVlID0gZGF0YS5waW5nO1xuICAgIHRoaXMucGluZy5zdGF0ZSA9IGRhdGEucGluZ1N0YXRlO1xuICAgIHRoaXMucGluZy5sYXN0VXBkYXRlID0gZGF0YS5waW5nTGFzdFVwZGF0ZTtcbiAgICB0aGlzLmh0dHAudmFsdWUgPSBkYXRhLmh0dHA7XG4gICAgdGhpcy5odHRwLnN0YXRlID0gZGF0YS5odHRwU3RhdGU7XG4gICAgdGhpcy5odHRwLmxhc3RVcGRhdGUgPSBkYXRhLmh0dHBMYXN0VXBkYXRlO1xuICAgIHRoaXMuY2hpbGRyZW4udmFsdWUgPSBkYXRhLmNoaWxkcmVuO1xuICAgIHRoaXMuY2hpbGRyZW4uc3RhdGUgPSBkYXRhLmNoaWxkcmVuU3RhdGU7XG4gICAgdGhpcy5jaGlsZHJlbi5sYXN0VXBkYXRlID0gZGF0YS5jaGlsZHJlbkxhc3RVcGRhdGU7XG59XG5cbkRvbWFpbi5wcm90b3R5cGUud3JpdGVTdGF0ZSA9IGFzeW5jIGZ1bmN0aW9uIChwcm9wZXJ0eU5hbWUpIHtcbiAgICB2YXIgZGJQYXJhbXMgPSB0aGlzLnRvRGIocHJvcGVydHlOYW1lKTtcbiAgICBhd2FpdCB0aGlzLmRiLmFSdW4oXCJVUERBVEUgZG9tYWlucyBTRVQgXCIgKyBwcm9wZXJ0eU5hbWUgKyBcIiA9ICRwcm9wLCBcIiArIHByb3BlcnR5TmFtZSArIFwiU3RhdGUgPSAkcHJvcFN0YXRlLCBcIiArIHByb3BlcnR5TmFtZSArIFwiTGFzdFVwZGF0ZSA9ICRwcm9wTGFzdFVwZGF0ZSBXSEVSRSBuYW1lID0gJG5hbWVcIiwgZGJQYXJhbXMpO1xufVxuRG9tYWluLnByb3RvdHlwZS5kZWxldGUgPSBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgYXdhaXQgdGhpcy5kYi5hUnVuKFwiREVMRVRFIEZST00gZG9tYWlucyBXSEVSRSBuYW1lID0gJG5hbWVcIiwgeyRuYW1lOiB0aGlzLm5hbWV9KTtcbn1cbkRvbWFpbi5wcm90b3R5cGUuY3JlYXRlID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGF3YWl0IHRoaXMuZGIuYVJ1bihcIklOU0VSVCBJTlRPIGRvbWFpbnMgKG5hbWUpIFZBTFVFUyAoJG5hbWUpXCIsIHtcbiAgICAgICAgJG5hbWU6IHRoaXMubmFtZVxuICAgIH0pO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zZXJ2ZXIvZG9tYWluLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImh0dHBcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJodHRwXCJcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBpbmdcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJwaW5nXCJcbi8vIG1vZHVsZSBpZCA9IDExXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImFic3RyYWN0ZGJcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJhYnN0cmFjdGRiXCJcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImJvZHktcGFyc2VyXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiYm9keS1wYXJzZXJcIlxuLy8gbW9kdWxlIGlkID0gMTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29tcHJlc3Npb25cIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJjb21wcmVzc2lvblwiXG4vLyBtb2R1bGUgaWQgPSAxNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9