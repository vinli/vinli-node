var extend = require('extend');

module.exports = function(client) {
  var Collision = function(_obj) {
    extend(this, _obj);
  };

  Collision.fetch = function(id) {
    return client.get('safety', 'collisions/' + id).then(function(resp) {
      return new Collision(resp.collision);
    });
  };

  Collision.forge = function(id) {
    return new Collision({ id: id });
  };

  return Collision;
};
