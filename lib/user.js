var extend = require('extend');
var Hoek = require('@hapi/hoek');

module.exports = function(client) {
  var User = function(_obj, _accessToken) {
    extend(this, _obj);
    this.accessToken = _accessToken;
  };

  User.prototype.devices = function() {
    var self = this;

    Hoek.assert(self.accessToken);
    return client.authGet('user/devices', self.accessToken).then(function(resp) {
      return {
        list: resp.devices.map(function(dev) {
          return new client.Device({ id: dev.id, name: dev.name, icon: dev.icon });
        })
      };
    });
  };

  User.fetch = function(accessToken) {
    return client.authGet('users/_current', accessToken, false).then(function(resp) {
      return new User(resp.user, accessToken);
    });
  };

  User.forge = function(accessToken) {
    return new User({}, accessToken);
  };

  return User;
};
