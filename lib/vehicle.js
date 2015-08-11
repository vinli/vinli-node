var Utils = require('./utils');
var Hoek = require('hoek');
var Joi = require('joi');
var extend = require('extend');

module.exports = function(client) {
  var Vehicle = function(_obj) {
    extend(this, _obj);
  };

  Vehicle.prototype.trips = function(_options) {
    var self = this;

    _options = Hoek.applyToDefaults({ limit: 20 }, _options || {});
    Joi.assert(_options, Utils.streamPaginationOptions);

    return client.get(
      'trip',
      'vehicles/' + this.id + '/trips',
      _options).then(function(resp) {
        resp.trips = resp.trips.map(function(v) { return new client.Trip(v); });
        return Utils.streamListResponse(resp, 'trips', self.trips, self);
      });
  };

  Vehicle.prototype.reportCards = function(_options) {
    var self = this;

    _options = Hoek.applyToDefaults({ limit: 20 }, _options || {});
    Joi.assert(_options, Utils.streamPaginationOptions);

    return client.get(
      'behavioral',
      'vehicles/' + this.id + '/report_cards',
      _options).then(function(resp) {
        resp.reportCards = resp.reportCards.map(function(v) { return new client.ReportCard(v); });
        return Utils.streamListResponse(resp, 'reportCards', self.reportCards, self);
      });
  };

  Vehicle.prototype.codes = function(_options) {
    var self = this;
    _options = Hoek.applyToDefaults({ limit: 20 }, _options || {});
    Joi.assert(_options, Utils.streamPaginationOptions);

    return client.get('diagnostic', 'vehicles/' + this.id + '/codes', _options).then(function(resp) {
      resp.codes = resp.codes.map(function(v) { return new client.Code(v); });
      return Utils.listResponse(resp, 'codes', self.codes, self);
    });
  };

  Vehicle.prototype.activeCodes = function(_options) {
    var self = this;
    _options = Hoek.applyToDefaults({ limit: 20 }, _options || {});
    Joi.assert(_options, Utils.streamPaginationOptions);
    _options = Hoek.merge({ state: 'active' }, _options);

    return client.get('diagnostic', 'vehicles/' + this.id + '/codes', _options).then(function(resp) {
      resp.codes = resp.codes.map(function(v) { return new client.Code(v); });
      return Utils.listResponse(resp, 'codes', self.codes, self);
    });
  };

  Vehicle.prototype.inactiveCodes = function(_options) {
    var self = this;
    _options = Hoek.applyToDefaults({ limit: 20 }, _options || {});
    Joi.assert(_options, Utils.streamPaginationOptions);
    _options = Hoek.merge({ state: 'inactive' }, _options);

    return client.get('diagnostic', 'vehicles/' + this.id + '/codes', _options).then(function(resp) {
      resp.codes = resp.codes.map(function(v) { return new client.Code(v); });
      return Utils.listResponse(resp, 'codes', self.codes, self);
    });
  };

  Vehicle.prototype.collisions = function(_options) {
    var self = this;
    _options = Hoek.applyToDefaults({ limit: 20 }, _options || {});
    Joi.assert(_options, Utils.streamPaginationOptions);

    return client.get(
      'safety',
      'vehicles/' + this.id + '/collisions',
      _options).then(function(resp) {
        resp.collisions = resp.collisions.map(function(v) { return new client.Collision(v); });
        return Utils.listResponse(resp, 'collisions', self.collisions, self);
      });
  };

  Vehicle.fetch = function(id) {
    return client.get('platform', 'vehicles/' + id).then(function(resp) {
      return new Vehicle(resp.vehicle);
    });
  };

  Vehicle.forge = function(id) {
    return new Vehicle({ id: id });
  };

  return Vehicle;
};
