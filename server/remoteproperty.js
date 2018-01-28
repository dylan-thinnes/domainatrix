var RemoteProperty = function (onChangeCallback, remoteGetter) {
    this.onChangeCallback = onChangeCallback;
    this.remoteGetter = remoteGetter;
    this.value = RemoteProperty.NEVER_STARTED;
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
RemoteProperty.UPDATE_THRESHOLD = 3600;

// Override the base primitive value evaluation of this object
RemoteProperty.prototype.valueOf = function () {
    return this.value;
}

RemoteProperty.prototype.set = async function (newValue, noTriggerChangeCallback) {
    var oldValue = this.value;
    this.value = newValue;
    if (oldValue !== this.value && this.value >= 0 && noTriggerChangeCallback !== true) await this.onChangeCallback();
}
RemoteProperty.prototype.get = function () {
    return this.value;
}
RemoteProperty.prototype.update = async function () { // Returns boolean dependent on whether an actual update check was made.
    var currTime = Date.now();
    if (Date.now() < this.lastUpdate + RemoteProperty.UPDATE_THRESHOLD) return false; // Abort if last update was too recent.
    this.lastUpdate = currTime;

    this.set(RemoteProperty.IN_PROGRESS);
    var valueExists = await new Promise(this.remoteGetter);
    await this.set(valueExists ? RemoteProperty.DOES_EXIST : RemoteProperty.DOES_NOT_EXIST);
    return true;
}
