var Utils = require('./utils');
var extend = require('extend');
var Hoek = require('hoek');
var Joi = require('joi');

module.exports = function(client) {
  var Rule = function(_obj) {
    extend(this, _obj);
  };

  Rule.fetch = function(id) {
    return client.get('rule', 'rules/' + id).then(function(resp) {
      return new Rule(resp.rule);
    });
  };

  Rule.forge = function(id) {
    return new Rule({ id: id });
  };

  Rule.prototype.delete = function() {
    return client.delete('rule', 'rules/' + this.id);
  };

  Rule.prototype.fill = function() {
    var self = this;
    return client.getRaw(self.links.self).then(function(resp) {
      self.boundaries = resp.rule.boundaries;
      return self;
    });
  };

  Rule.prototype.subscriptions = function(deviceId) {
    var self = this;

    deviceId = deviceId || this.deviceId;

    Hoek.assert(deviceId, 'The Rule must have deviceId set internally or passed in the options when loading events');

    return client.get(
      'event',
      'devices/' + deviceId + '/subscriptions',
      { objectType: 'rule', objectId: this.id }
    ).then(function(resp) {
      resp.subscriptions = resp.subscriptions.map(function(v) { return new client.Subscription(v); });
      return Utils.listResponse(resp, 'subscriptions', self.subscriptions, self);
    });
  };

  Rule.prototype.createSubscription = function(_options) {
    var self = this;

    var deviceId = this.deviceId || (_options || {}).deviceId;
    if (_options) {
      delete _options.deviceId;
    }

    Hoek.assert(deviceId, 'The Rule must have deviceId set internally or passed in the options when creating a subscripton');

    return client.post(
      'event',
      'devices/' + deviceId + '/subscriptions',
      { subscription: Hoek.merge(_options, { object: { type: 'rule', id: self.id } }) }
    ).then(function(resp) {
      return new client.Subscription(resp.subscription);
    });
  };

  Rule.prototype.events = function(_options) {
    var self = this;

    var deviceId = this.deviceId || (_options || {}).deviceId;
    if (_options) {
      delete _options.deviceId;
    }

    Hoek.assert(deviceId, 'The Rule must have deviceId set internally or passed in the options when loading events');

    _options = Hoek.applyToDefaults({ limit: 20, objectId: this.id, type: 'rule-*' }, _options || {});
    Joi.assert(_options, {
      limit: Joi.number().integer().min(0).max(100),
      since: Joi.date(),
      until: Joi.date(),
      type: Joi.string(),
      objectId: Joi.string(),
      objectType: Joi.string()
    });

    return client.get(
      'event',
      'devices/' + deviceId + '/events',
      _options).then(function(resp) {
        return Utils.streamListResponse(resp, 'events', self.events, self);
      });
  };

  return Rule;
};
