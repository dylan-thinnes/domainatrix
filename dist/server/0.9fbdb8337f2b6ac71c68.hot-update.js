exports.id = 0;
exports.modules = {

/***/ 65:
/***/ (function(module, exports, __webpack_require__) {

const path = __webpack_require__(3);
const express = __webpack_require__(30);
const app = express();
const routes = __webpack_require__(127);
const bodyParser = __webpack_require__(31);
const compression = __webpack_require__(142);

// add compression support
app.use(compression());
// fallthrough to static files
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


/***/ })

};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zZXJ2ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLGtCQUFrQjs7QUFFakQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFOztBQUVGLENBQUM7O0FBRUQ7QUFDQSIsImZpbGUiOiIwLjlmYmRiODMzN2YyYjZhYzcxYzY4LmhvdC11cGRhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5jb25zdCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xuY29uc3QgYXBwID0gZXhwcmVzcygpO1xuY29uc3Qgcm91dGVzID0gcmVxdWlyZSgnLi9yb3V0ZXMuanMnKTtcbmNvbnN0IGJvZHlQYXJzZXIgPSByZXF1aXJlKCdib2R5LXBhcnNlcicpO1xuY29uc3QgY29tcHJlc3Npb24gPSByZXF1aXJlKCdjb21wcmVzc2lvbicpO1xuXG4vLyBhZGQgY29tcHJlc3Npb24gc3VwcG9ydFxuYXBwLnVzZShjb21wcmVzc2lvbigpKTtcbi8vIGZhbGx0aHJvdWdoIHRvIHN0YXRpYyBmaWxlc1xuLy8gcGFyc2UgYm9keSBwYXJhbWV0ZXJzLCB1c2UgYmFzaWMgZmxhdCBxdWVyeXN0cmluZ1xuYXBwLnVzZShib2R5UGFyc2VyLnVybGVuY29kZWQoeyBleHRlbmRlZDogZmFsc2UgfSkpO1xuXG5yb3V0ZXMubWFrZVJvdXRlcygpLnRoZW4oc3ViYXBwID0+IHtcblx0YXBwLnVzZShzdWJhcHApO1xuXG5cdGFwcC5nZXQoJyonLCAocmVxLCByZXMpID0+IHtcblx0XHRyZXMuc3RhdHVzID0gNDA0O1xuXHRcdHJlcy5zZW5kKCcnKTtcblx0fSk7XG5cbn0pO1xuXG5pZiAocHJvY2Vzcy5hcmd2LmluY2x1ZGVzKFwiLWRcIikpIGFwcC5saXN0ZW4oODA4MCk7XG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBhcHA7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NlcnZlci9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gNjVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==