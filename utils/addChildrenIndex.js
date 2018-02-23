var abstractdb = require("abstractdb");
var Database = abstractdb("better-sqlite3");
var db = new Database("server/app.db");
db.sRun("ALTER TABLE domains RENAME TO oldDomains");
db.sRun(`CREATE TABLE domains (
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
db.sRun("INSERT INTO domains(name, dnsState, dnsLastUpdate, pingState, pingLastUpdate, httpState, httpLastUpdate) SELECT name, dnsState, dnsLastUpdate, pingState, pingLastUpdate, httpState, httpLastUpdate FROM oldDomains");
db.sRun("DROP TABLE oldDomains");
res = db.sAll("SELECT * FROM domains");
console.log(res);
