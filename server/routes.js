const express = require('express');
const DomainData = require('./domaindata');

const makeRoutes = () => {
	const app = express();

	// TODO: the internal structure of DomainData's "callback control" mechanism makes this janky
	// wrapping in a promise is a temporary (but effective) solution
	return new Promise((resolve, reject) => {
		const domData = new DomainData("domains.txt", () => {
				resolve(domData);
		});
	}).then(domData => {

		// domData returns everything as a string. for ease of use i'm just converting it right back to json and letting express automatically add the json headers/everything else
		
		app.get('/add', (req, res) => {
			domData.addDomainCandidate(req.query.domain, true, r => {
				res.json(JSON.parse(r)); // temporary until DomainData is patched to return an object
			});
		});
		app.get('/dns', (req, res) => {
			domData.getXFromDomain('dns', req.query.domain, r => {
				res.json(JSON.parse(r)); // temporary, see above
			});
		});
		app.get('/ping', (req, res) => {
			domData.getXFromDomain('ping', req.query.domain, r => {
				res.json(JSON.parse(r)); // temporary, see above
			})
		});
		app.get('/http', (req, res) => {
			domData.getXFromDomain('http', req.query.domain, r => {
				res.json(JSON.parse(r)); // temporary, see above
			});
		});
		app.get('/data', (req, res) => {
			res.json(JSON.parse(domData.getJson())); // temporary, see above
		});

		return app;
	});
}

exports = module.exports = { makeRoutes }
