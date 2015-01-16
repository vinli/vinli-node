var Utils = require('./utils');
var extend = require('extend');
var yarp = require('yarp');

var Auth = function(_obj){
  extend(this, _obj);
};

Auth.exchange = function(authCode, redirectUri, clientId, clientSecret){
  return yarp({
    url: Utils.request.buildUrl('auth', 'oauth/token', {}, true),
    method: 'POST',
    json: {
      'grant_type': 'authorization_code',
      'code': authCode,
      'redirect_uri': redirectUri
    },
    auth: {
      user: clientId,
      pass: clientSecret
    }
  }).then(function(resp){
    return resp['access_token'];
  });
};

module.exports = Auth;