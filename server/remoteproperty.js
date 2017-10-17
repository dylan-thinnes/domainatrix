class RemoteProperty {

	constructor (domainName, checker, handler, change) {
		/* State 0 is resolved positive position,
		 * State 1 is resolved negative position,
		 * State -1 is processing or undetermined state
		 * State -2 is never process / not yet initialized state
		 */
		this.domainName = domainName;
		this.checker = checker;
		this.handler = handler;
		this.lastCheck = 0;
		this.state = -2;
		this.callbacks = [];
		this.change = change;
	}
	check (/* callbacks passed in here */) {
		for (var ii = 0; ii < arguments.length; ii++) {
			this.callbacks.push(arguments[ii]);
		}
		if (this.lastCheck >= Date.now() - 30*60*1000) this.runCallbacks();
		else if (this.state !== -1) {
			this.state = -1;
			this.checker(this.setState.bind(this));
		}
	}
	setState () {
		this.lastCheck = Date.now();
		var oldState = this.state;
		this.state = this.handler.apply(this, arguments);
		if (oldState !== this.state) this.change(this.state);
		this.runCallbacks();
	}
	runCallbacks () {
		while (this.callbacks.length > 0) {
			(this.callbacks.pop())(this.state);
		}
	}
}
exports = module.exports = RemoteProperty;
