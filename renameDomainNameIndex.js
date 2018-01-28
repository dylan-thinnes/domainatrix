var abstractdb = require("abstractdb");
var Database = abstractdb("better-sqlite3");
var db = new Database("app.db");
/*db.sRun("ALTER TABLE domains RENAME TO oldDomains");
db.sRun(`CREATE TABLE domains (
    name TEXT PRIMARY KEY,
    dns INTEGER NOT NULL,
    dnsLastUpdate INTEGER NOT NULL,
    ping INTEGER NOT NULL,
    pingLastUpdate INTEGER NOT NULL,
    http INTEGER NOT NULL,
    httpLastUpdate INTEGER NOT NULL
)`);
db.sRun("INSERT INTO domains(name, dns, dnsLastUpdate, ping, pingLastUpdate, http, httpLastUpdate) SELECT name, dns, dnsLastCheck, ping, pingLastCheck, http, httpLastCheck FROM oldDomains");
db.sRun("DROP TABLE oldDomains");*/
res = db.sAll("SELECT * FROM domains");
console.log(res);
