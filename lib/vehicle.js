var Utils = require('./utils');
var Hoek = require('hoek');
var Joi = require('joi');
var Trip =require('./trip');
var extend = require('extend');

var Vehicle = function(_obj){
  extend(this, _obj);
};

Vehicle.prototype.trips = function(_options){
  _options = Hoek.applyToDefaults({offset: 0, limit: 20}, _options || {});
  Joi.assert(_options, Utils.paginationOptions);

  return Utils.request.get(
    'trips',
    'vehicles/'+this.id+'/trips',
    _options).then(function(resp){
      return {
        list: resp.trips.map(function(v){ return new Trip(v); }),
        total: resp.meta.pagination.total,
        hasMore: resp.meta.pagination.links.next ? true : false,
        stats: resp.meta.stats
      };
    });
};

Vehicle.fetch = function(id){
  return Utils.request.get('platform', 'vehicles/'+id).then(function(resp){
    return new Vehicle(resp.vehicle);
  });
};

Vehicle.forge = function(id){
  return new Vehicle({id: id});
};

module.exports = Vehicle;