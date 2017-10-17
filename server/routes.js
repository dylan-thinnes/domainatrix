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
		app.get('/add', (req, res) => {
			domData.addDomainCandidate(req.query.domain, r => {
				res.json(r);
			});
		});
		app.get('/dns', (req, res) => {
			domData.getXFromDomain('dns', req.query.domain, r => {
				res.json(r);
			});
		});
		app.get('/ping', (req, res) => {
			domData.getXFromDomain('ping', req.query.domain, r => {
				res.json(r);
			})
		});
		app.get('/http', (req, res) => {
			domData.getXFromDomain('http', req.query.domain, r => {
				res.json(r);
			});
		});
		app.get('/data', (req, res) => {
			res.json(domData.getJson());
		});

		return app;
	});
}

exports = module.exports = { makeRoutes }
