const express = require('express');
const DomainData = require('./domaindata');

const makeRoutes = async function () {
	const app = express();

	const domData = new DomainData();
    await domData.init();

    app.get('/v1/domains/:name/dns', async (req, res, next) => {
        if (req.params.name == undefined) next();
        var r = await domData.getXFromDomain('dns', req.params.name);
        res.json(r);
    });
    app.get('/v1/domains/:name/ping', async (req, res, next) => {
        if (req.params.name == undefined) next();
        var r = await domData.getXFromDomain('ping', req.params.name);
        res.json(r);
    });
    app.get('/v1/domains/:name/http', async (req, res, next) => {
        if (req.params.name == undefined) next();
        var r = await domData.getXFromDomain('http', req.params.name);
        res.json(r);
    });

    app.post('/v1/domains', async (req, res, next) => {
        if (req.body.name == undefined) next();
        var r = await domData.addDomainCandidate(req.body.name, true);
        res.json(r);
    });
    app.get('/v1/domains', (req, res) => {
        res.json(domData.getJson());
    });

    return app;
}

exports = module.exports = { makeRoutes }
