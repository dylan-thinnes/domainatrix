const fs = require("fs");
const sqlite3 = require("sqlite3");


var db = new sqlite3.Database("app.db");
var writeJsonFileToDb = function (name, err, res) {
	console.log("Name: ", name, "res: ", res.toString());
	if (err) {
		throw err;
	}
	var jsonRes = JSON.parse(res);
	var input = {
		$domainName: jsonRes.domainName,
		$dns: jsonRes.dns.state,
		$dnsLastCheck: jsonRes.dns.lastCheck,
		$ping: jsonRes.ping.state,
		$pingLastCheck: jsonRes.ping.lastCheck,
		$http: jsonRes.http.state,
		$httpLastCheck: jsonRes.http.lastCheck
	}
	console.log()
	db.run("UPDATE domains SET dns = $dns, dnsLastCheck = $dnsLastCheck, ping = $ping, pingLastCheck = $pingLastCheck, http = $http, httpLastCheck = $httpLastCheck WHERE domainName = $domainName", input);
}
var res = fs.readdirSync("./domains");
for (var ii = 0; ii < res.length; ii++) {
	let name = res[ii].replace(/^(.+)\.txt$/g, "$1");
	console.log(name);
	fs.readFile("./domains/" + res[ii], "utf8", writeJsonFileToDb.bind(this, name));
}
