var abstractdb = require("abstractdb");
var Database = abstractdb("better-sqlite3");
var db = new Database("server/app.db");
var res = db.sAll("SELECT name FROM domains");
var candidates = [];
for (var ii in res) {
    var name = res[ii].name;
    if (name === name.toLowerCase()) continue;
    console.log(name);
    if (db.sGet("SELECT * FROM domains WHERE name = $name", {
        $name: name.toLowerCase()
    }) != undefined) {
        db.sRun("DELETE FROM domains WHERE name = $name", {
            $name: name
        });
        continue;
    };
    candidates.push(db.aRun("UPDATE domains SET name = $nameLowerCase WHERE name = $name", {
        $name: name,
        $nameLowerCase: name.toLowerCase()
    }));
}
Promise.all(candidates);
