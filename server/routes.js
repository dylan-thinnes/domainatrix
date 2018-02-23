const express = require('express');
const DomainData = require('./domaindata');

const makeRoutes = async function () {
	const app = express();

	const domData = new DomainData();
    await domData.init();

    app.put('/v1/domains/:name/dns', async (req, res, next) => {
        if (req.params.name == undefined) return next();
        var r = await domData.updateXFromDomain('dns', req.params.name);
        res.json(r);
    });
    app.put('/v1/domains/:name/ping', async (req, res, next) => {
        if (req.params.name == undefined) return next();
        var r = await domData.updateXFromDomain('ping', req.params.name);
        res.json(r);
    });
    app.put('/v1/domains/:name/http', async (req, res, next) => {
        if (req.params.name == undefined) return next();
        var r = await domData.updateXFromDomain('http', req.params.name);
        res.json(r);
    });
    app.put('/v1/domains/:name/children', async (req, res, next) => {
        if (req.params.name == undefined) return next();
        var r = await domData.updateXFromDomain('children', req.params.name);
        res.json(r);
    });
    app.get('/v1/domains/:name', async (req, res, next) => {
        if (req.params.name == undefined) return next();
        var r = domData.getJson(req.params.name);
        if (r == undefined) next();
        else res.json(r);
    });

    app.post('/v1/domains', async (req, res, next) => {
        if (req.body.names == undefined) return next();
        var r = await domData.addDomainCandidates(req.body.names);
        res.json(r);
    });
    app.get('/v1/domains', (req, res) => {
        res.json(domData.getJson());
    });

    return app;
}

exports = module.exports = { makeRoutes }
