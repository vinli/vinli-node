var Utils = require('./utils');
var extend = require('extend');
var Q = require('q');

var Rule = function(_obj) {
  extend(this, _obj);
};

Rule.fetch = function(id) {
  return Utils.request.get('events', 'rules/' + id).then(function(resp) {
    return new Rule(resp.rule);
  });
};

Rule.forge = function(id) {
  return new Rule({ id: id });
};

Rule.prototype.currentState = function(device) {
  if (!this.deviceId && !device) {
    return Q.reject('If this Rule was created using forge, then a device must be given to call currentState');
  }

  var deviceId = this.deviceId || device.id;

  return Utils.request.get('events', 'devices/' + deviceId + '/rules/' + this.id + '/state').then(function(resp) {
    return resp.state;
  });
};

Rule.prototype.delete = function() {
  return Utils.request.delete('events', 'rules/' + this.id);
};

module.exports = Rule;