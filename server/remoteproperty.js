const util = require("util");

var RemoteProperty = function (onChangeCallback, remoteGetter) {
    this.onChangeCallback = onChangeCallback;
    this.remoteGetter = remoteGetter;
    this.state = RemoteProperty.NEVER_STARTED;
    this.value = undefined;
    this.lastUpdate = 0;
}
exports = module.exports = RemoteProperty;

RemoteProperty.NEVER_STARTED = -2;
RemoteProperty.IN_PROGRESS = -1;
RemoteProperty.DOES_EXIST = 0;
RemoteProperty.DOES_NOT_EXIST = 1;
/* State 0 is resolved positive position,
 * State 1 is resolved negative position,
 * State -1 is processing or undetermined state
 * State -2 is never processed / not yet initialized state
 */
RemoteProperty.UPDATE_THRESHOLD = process.argv.includes("-d") ? 0 : 3600;

// Override the base primitive value evaluation of this object
RemoteProperty.prototype.valueOf = function () {
    return this.state;
}

RemoteProperty.prototype.set = async function (newValue, noTriggerChangeCallback) {
    this.state = newValue != undefined ? RemoteProperty.DOES_EXIST : RemoteProperty.DOES_NOT_EXIST;
    if (util.isDeepStrictEqual(this.value, newValue)) return;
    this.value = newValue;
    if (noTriggerChangeCallback !== true) await this.onChangeCallback();
}
RemoteProperty.prototype.get = function () {
    return this.value;
}
RemoteProperty.prototype.update = async function () { // Returns boolean dependent on whether an actual update check was made.
    var currTime = Date.now();
    if (Date.now() < this.lastUpdate + RemoteProperty.UPDATE_THRESHOLD) return false; // Abort if last update was too recent.
    this.lastUpdate = currTime;

    this.state = RemoteProperty.IN_PROGRESS;
    var newValue = await new Promise(this.remoteGetter);
    await this.set(newValue);
    return true;
}
