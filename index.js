const express = require('express');
const app = express();
const routes = require('./server/routes.js');
const bodyParser = require('body-parser');

// fallthrough to static files
app.use(express.static(__dirname + '/static'));
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
