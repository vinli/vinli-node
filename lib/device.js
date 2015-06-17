var Utils = require('./utils');
var Hoek = require('hoek');
var Joi = require('joi');
var extend = require('extend');

module.exports = function(client) {
  var Device = function(_obj) {
    extend(this, _obj);
  };

  Device.prototype.type = 'Device';

  Device.prototype.vehicles = function(_options) {
    var self = this;
    _options = Hoek.applyToDefaults({ offset: 0, limit: 20 }, _options);
    Joi.assert(_options || {}, Utils.paginationOptions);

    return client.get(
      'platform',
      'devices/' + this.id + '/vehicles',
      _options
    ).then(function(resp) {
      resp.vehicles = resp.vehicles.map(function(v) { return new client.Vehicle(v); });
      return Utils.listResponse(resp, 'vehicles', self.vehicles, self);
    });
  };

  Device.prototype.latestVehicle = function() {
    return client.get(
      'platform',
      'devices/' + this.id + '/vehicles/_latest'
    ).then(function(resp) {
      if (!resp.vehicle) {
        return null;
      }
      return new client.Vehicle(resp.vehicle);
    });
  };

  Device.prototype.messages = function(_options) {
    var self = this;
    _options = Hoek.applyToDefaults({ limit: 20 }, _options || {});
    Joi.assert(_options, Utils.streamPaginationOptions);

    return client.get(
      'telemetry',
      'devices/' + self.id + '/messages',
      _options).then(function(resp) {
        return Utils.streamListResponse(resp, 'messages', self.messages, self);
      });
  };

  Device.prototype.message = function(messageId) {
    return client.get(
      'telemetry',
      'devices/' + this.id + '/messages/' + messageId
    ).then(function(resp) {
      return resp.message;
    });
  };

  Device.prototype.snapshots = function(_options) {
    var self = this;
    var fields = _options.fields;
    delete _options.fields;
    _options = Hoek.applyToDefaults({ limit: 20 }, _options || {});
    Joi.assert(_options, Utils.streamPaginationOptions);

    if (Array.isArray(fields)) {
      _options.fields = fields.join(',');
    } else {
      _options.fields = fields;
    }

    return client.get(
      'telemetry',
      'devices/' + self.id + '/snapshots',
      _options).then(function(resp) {
        return Utils.streamListResponse(resp, 'snapshots', self.snapshots, self);
      });
  };

  Device.prototype.locations = function(_options) {
    var self = this;
    _options = Hoek.applyToDefaults({ limit: 20 }, _options || {});
    Joi.assert(_options, Utils.streamPaginationOptions);

    return client.get(
      'telemetry',
      'devices/' + self.id + '/locations',
      _options).then(function(resp) {
        return Utils.streamListResponse(resp, 'locations', self.locations, self);
      });
  };

  Device.prototype.events = function(_options) {
    var self = this;

    _options = Hoek.applyToDefaults({ limit: 20 }, _options || {});
    Joi.assert(_options, {
      limit: Joi.number().integer().min(0).max(100),
      since: Joi.date(),
      until: Joi.date(),
      type: Joi.string()
    });

    return client.get(
      'event',
      'devices/' + self.id + '/events',
      _options).then(function(resp) {
        return Utils.streamListResponse(resp, 'events', self.events, self);
      });
  };

  Device.prototype.trips = function(_options) {
    var self = this;
    _options = Hoek.applyToDefaults({ offset: 0, limit: 20 }, _options || {});
    Joi.assert(_options, Utils.paginationOptions);

    return client.get(
      'trip',
      'devices/' + this.id + '/trips',
      _options).then(function(resp) {
        resp.trips = resp.trips.map(function(v) { return new client.Trip(v); });
        return Utils.listResponse(resp, 'trips', self.trips, self);
      });
  };

  Device.prototype.rules = function(_options) {
    var self = this;
    _options = Hoek.applyToDefaults({ offset: 0, limit: 20 }, _options || {});
    Joi.assert(_options, Utils.paginationOptions);

    return client.get(
      'rule',
      'devices/' + this.id + '/rules',
      _options).then(function(resp) {
        resp.rules = resp.rules.map(function(v) { return new client.Rule(v); });
        return Utils.listResponse(resp, 'rules', self.rules, self);
      });
  };

  Device.prototype.createRule = function(_payload) {
    return client.post(
      'rule',
      'devices/' + this.id + '/rules',
      { rule: _payload }).then(function(resp) {
        return new client.Rule(resp.rule);
      });
  };
  
  Device.prototype.createSubscription = function(_options) {
    return client.post(
      'event',
      'devices/' + this.id + '/subscriptions',
      { subscription: _options }).then(function(resp) {
        return new client.Subscription(resp.subscription);
      });
  };

  Device.fetch = function(id) {
    return client.get('platform', 'devices/' + id).then(function(resp) {
      return new Device(resp.device);
    });
  };

  Device.forge = function(id) {
    return new Device({ id: id });
  };

  return Device;
};