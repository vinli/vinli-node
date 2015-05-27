var extend = require('extend');

module.exports = function(client) {
  var Event = function(_obj) {
    extend(this, _obj);
  };

  Event.fetch = function(id) {
    return client.get('event', 'events/' + id).then(function(resp) {
      return new Event(resp.event);
    });
  };

  Event.forge = function(id) {
    return new Event({ id: id });
  };

  return Event;
};