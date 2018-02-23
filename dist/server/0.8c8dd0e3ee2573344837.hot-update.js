exports.id = 0;
exports.modules = {

/***/ 65:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__dirname) {const path = __webpack_require__(3);
const express = __webpack_require__(30);
const app = express();
const routes = __webpack_require__(127);
const bodyParser = __webpack_require__(31);
const compression = __webpack_require__(142);

// add compression support
app.use(compression());
// fallthrough to static files
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

/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ })

};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zZXJ2ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0Isa0JBQWtCOztBQUVqRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7O0FBRUYsQ0FBQzs7QUFFRDtBQUNBIiwiZmlsZSI6IjAuOGM4ZGQwZTNlZTI1NzMzNDQ4MzcuaG90LXVwZGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcbmNvbnN0IGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG5jb25zdCBhcHAgPSBleHByZXNzKCk7XG5jb25zdCByb3V0ZXMgPSByZXF1aXJlKCcuL3JvdXRlcy5qcycpO1xuY29uc3QgYm9keVBhcnNlciA9IHJlcXVpcmUoJ2JvZHktcGFyc2VyJyk7XG5jb25zdCBjb21wcmVzc2lvbiA9IHJlcXVpcmUoJ2NvbXByZXNzaW9uJyk7XG5cbi8vIGFkZCBjb21wcmVzc2lvbiBzdXBwb3J0XG5hcHAudXNlKGNvbXByZXNzaW9uKCkpO1xuLy8gZmFsbHRocm91Z2ggdG8gc3RhdGljIGZpbGVzXG5hcHAudXNlKGV4cHJlc3Muc3RhdGljKHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9jbGllbnQnKSkpO1xuLy8gcGFyc2UgYm9keSBwYXJhbWV0ZXJzLCB1c2UgYmFzaWMgZmxhdCBxdWVyeXN0cmluZ1xuYXBwLnVzZShib2R5UGFyc2VyLnVybGVuY29kZWQoeyBleHRlbmRlZDogZmFsc2UgfSkpO1xuXG5yb3V0ZXMubWFrZVJvdXRlcygpLnRoZW4oc3ViYXBwID0+IHtcblx0YXBwLnVzZShzdWJhcHApO1xuXG5cdGFwcC5nZXQoJyonLCAocmVxLCByZXMpID0+IHtcblx0XHRyZXMuc3RhdHVzID0gNDA0O1xuXHRcdHJlcy5zZW5kKCcnKTtcblx0fSk7XG5cbn0pO1xuXG5pZiAocHJvY2Vzcy5hcmd2LmluY2x1ZGVzKFwiLWRcIikpIGFwcC5saXN0ZW4oODA4MCk7XG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBhcHA7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NlcnZlci9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gNjVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==