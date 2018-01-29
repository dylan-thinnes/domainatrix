var abstractdb = require("abstractdb");
var Database = abstractdb("better-sqlite3");
var db = new Database("server/app.db");
db.sRun("ALTER TABLE domains RENAME TO oldDomains");
db.sRun(`CREATE TABLE domains (
    name TEXT PRIMARY KEY,
    dns STRING,
    dnsState INTEGER NOT NULL,
    dnsLastUpdate INTEGER NOT NULL,
    ping INTEGER,
    pingState INTEGER NOT NULL,
    pingLastUpdate INTEGER NOT NULL,
    http INTEGER,
    httpState INTEGER NOT NULL,
    httpLastUpdate INTEGER NOT NULL
)`);
db.sRun("INSERT INTO domains(name, dnsState, dnsLastUpdate, pingState, pingLastUpdate, httpState, httpLastUpdate) SELECT name, dnsState, dnsLastUpdate, pingState, pingLastUpdate, httpState, httpLastUpdate FROM oldDomains");
db.sRun("DROP TABLE oldDomains");
res = db.sAll("SELECT * FROM domains");
console.log(res);
