var extend = require('extend');
var qs = require('querystring');

module.exports = function(client) {
  var Trip = function(_obj) {
    extend(this, _obj);
  };

  Trip.prototype.locations = function(_options) {
    var self = this;
    _options = _options || {};
    if (_options.all) {
      var query = {
        limit: 100,
        fields: (_options.fields && _options.fields.length) ? _options.fields.join(',') : undefined
      };
      return client.getEntireLocationStream(self.links.locations + '&' + qs.stringify(query));
    }

    return client.getRaw(self.links.locations).then(function(resp) {
      return resp.locations.features;
    });
  };

  Trip.fetch = function(id) {
    return client.get('trip', 'trips/' + id).then(function(resp) {
      return new Trip(resp.trip);
    });
  };

  Trip.forge = function(id) {
    return new Trip({ id: id });
  };

  return Trip;
};