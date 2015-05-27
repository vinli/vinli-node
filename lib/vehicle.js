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

    _options = Hoek.applyToDefaults({ offset: 0, limit: 20 }, _options || {});
    Joi.assert(_options, Utils.paginationOptions);

    return client.get(
      'trip',
      'vehicles/' + this.id + '/trips',
      _options).then(function(resp) {
        resp.trips = resp.trips.map(function(v) { return new client.Trip(v); });
        return Utils.listResponse(resp, 'trips', self.trips, self);
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