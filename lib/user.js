var Utils = require('./utils');
var Device =require('./device');
var extend = require('extend');

var User = function(_obj, _accessToken){
  extend(this, _obj);
  this.accessToken = _accessToken;
};

User.prototype.devices = function(){
  var self = this;
  return Utils.request.authGet('user/devices', self.accessToken).then(function(resp){
    return {
      list: resp.devices.map(function(dev){
        return new Device({id: dev.id, name: dev.name});
      })
    };
  }).catch(console.log);
};

User.fetch = function(accessToken){
  return Utils.request.authGet('user', accessToken).then(function(resp){
    return new User(resp.user, accessToken);
  });
};

User.forge = function(accessToken){
  return new User({}, accessToken);
};

module.exports = User;