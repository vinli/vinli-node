var extend = require('extend');

module.exports = function(client) {
  var OdometerTrigger = function(_obj) {
    extend(this, _obj);
  };

  OdometerTrigger.fetch = function(id) {
    return client.get('distance', 'odometer_triggers/' + id)
      .then(function(resp) {
        return new OdometerTrigger(resp.odometerTrigger);
      });
  };

  OdometerTrigger.forge = function(id) {
    return new OdometerTrigger({ id: id });
  };

  OdometerTrigger.prototype.delete = function() {
    return client.delete('distance', 'odometer_triggers/' + this.id);
  };

  return OdometerTrigger;
};
