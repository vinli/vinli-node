var Utils = require('./utils');
var extend = require('extend');
var qs = require('querystring');

var Trip = function(_obj){
  extend(this, _obj);
};

Trip.prototype.locations = function(_options){
  var self = this;
  _options = _options || {};
  if(_options.all){
    var query = {
      limit: 100,
      fields: (_options.fields && _options.fields.length) ? _options.fields.join(',') : undefined
    };
    return Utils.request.getEntireLocationStream(self.links.locations+'&'+qs.stringify(query));
  } else {
    return Utils.request._getRaw(self.links.locations).then(function(resp){
      return resp.locations.features;
    });
  }
};

Trip.fetch = function(id){
  return Utils.request.get('trips', 'trips/'+id).then(function(resp){
    return new Trip(resp.trip);
  });
};

Trip.forge = function(id){
  return new Trip({id: id});
};

module.exports = Trip;