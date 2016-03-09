var extend = require('extend');

module.exports = function(client) {
  var Odometer = function(_obj) {
    extend(this, _obj);
  };

  Odometer.fetch = function(id) {
    return client.get('distance', 'odometers/' + id)
      .then(function(resp) {
        return new Odometer(resp.odometer);
      });
  };

  Odometer.forge = function(id) {
    return new Odometer({ id: id });
  };

  Odometer.prototype.delete = function() {
    return client.delete('distance', 'odometers/' + this.id);
  };

  return Odometer;
};
