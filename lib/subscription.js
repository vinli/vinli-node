var Utils = require('./utils');
var extend = require('extend');
var Hoek = require('@hapi/hoek');
var Joi = require('@hapi/joi');

module.exports = function(client) {
  var Subscription = function(_obj) {
    extend(this, _obj);
  };

  Subscription.fetch = function(id) {
    return client.get('event', 'subscriptions/' + id).then(function(resp) {
      return new Subscription(resp.subscription);
    });
  };

  Subscription.forge = function(id) {
    return new Subscription({ id: id });
  };

  Subscription.prototype.delete = function() {
    return client.delete('event', 'subscriptions/' + this.id);
  };

  Subscription.prototype.notifications = function(_options) {
    var self = this;
    _options = Hoek.applyToDefaults({ offset: 0, limit: 20 }, _options || {});
    Joi.assert(_options, Utils.paginationOptions);

    return client.get(
      'event',
      'subscriptions/' + this.id + '/notifications',
      _options).then(function(resp) {
        return Utils.listResponse(resp, 'notifications', self.notifications, self);
      });
  };

  return Subscription;
};