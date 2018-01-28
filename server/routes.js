const express = require('express');
const DomainData = require('./domaindata');

const makeRoutes = async function () {
	const app = express();

	const domData = new DomainData();
    await domData.init();

    app.get('/add', async (req, res) => {
        var r = await domData.addDomainCandidate(req.query.domain, true);
        res.json(r);
    });
    app.get('/dns', async (req, res) => {
        var r = await domData.getXFromDomain('dns', req.query.domain);
        res.json(r);
    });
    app.get('/ping', async (req, res) => {
        var r = await domData.getXFromDomain('ping', req.query.domain);
        res.json(r);
    });
    app.get('/http', async (req, res) => {
        var r = await domData.getXFromDomain('http', req.query.domain);
        res.json(r);
    });
    app.get('/data', (req, res) => {
        res.json(domData.getJson());
    });

    return app;
}

exports = module.exports = { makeRoutes }
