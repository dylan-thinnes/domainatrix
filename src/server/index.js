const path = require("path");
const express = require('express');
const app = express();
const routes = require('./routes.js');
const bodyParser = require('body-parser');
const compression = require('compression');

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
